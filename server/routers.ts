import { 
  COOKIE_NAME, 
  LEADERBOARD_TIMEFRAMES, 
  COMMUNITY_CATEGORY_VALUES, 
  VOTE_TYPES 
} from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { getCacheStats } from "./_core/redis";
import { createCheckoutSessionForTier, isStripeConfigured, STRIPE_PLANS, type TierType } from "./_core/stripe";
import { TRPCError } from "@trpc/server";

const BROCRAFT_SYSTEM_PROMPT = `Você é BROCRAFT v∞, o irmão mais velho especialista em fermentação, cerveja, charcutaria, queijos e destilados educacionais.

# IDENTIDADE
- Tom: Direto, com humor ácido, gírias craft ("Mano", "Macete de Avó", "Foda")
- Missão: Transformar qualquer pessoa em Mestre Fermentador
- Regra: Nunca minta. Sempre ensine o PORQUÊ científico.

# DOMÍNIOS
- Cervejaria: Gruit → Hazy IPA, Kveik, Brett, IBU, ABV
- Fermentados: Koji, Kimchi, Kombucha, Levain, Miso
- Laticínios: Queijos frescos, curados, Roquefort, Parmesão
- Charcutaria: Salame, Guanciale, Sal de Cura #2, pH < 4.6
- Destilados: Mash bill, hearts cut, envelhecimento (EDUCACIONAL)

# PROCESSO
1. PERGUNTE: "O que você TEM? (panela, termômetro, ingredientes)"
2. ADAPTE: Molde a receita aos recursos do usuário
3. TRIDENTE: Dê 3 caminhos (RAJADO/CLÁSSICO/MESTRE)
4. MACETE: Inclua dica prática não-óbvia
5. XP: Dê +XP ao final

# SEGURANÇA
- Charcutaria: ⚠️ BOTULISMO MATA. Use sal de cura #2. pH < 4.6.
- Destilados: ⚠️ DESTILAÇÃO ILEGAL NO BR (Art. 288 CP). EDUCACIONAL.

Status inicial: "Carga aceita. BROCRAFT v∞ online. Fogo aceso. Fermento vivo."`;

export const appRouter = router({
  system: systemRouter,
  
  // Cache Status (Admin)
  cacheStatus: publicProcedure.query(() => {
    return getCacheStats();
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat Router
  chat: router({
    send: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        try {
          // Get user profile for context
          const userProfile = await db.getUserProfile(userId, orgId);
          
          // =============================================
          // PAYWALL: Verificar limite de mensagens diárias
          // =============================================
          const tier = userProfile.tier as keyof typeof db.TIER_LIMITS;
          const tierLimits = db.TIER_LIMITS[tier] || db.TIER_LIMITS.FREE;
          
          if (tierLimits.dailyMessages !== Infinity) {
            const messagesToday = await db.countUserMessagesToday(userId, orgId);
            
            if (messagesToday >= tierLimits.dailyMessages) {
              // [BROCRAFT][EVENT] Telemetria de limite de mensagens atingido
              console.log(`[BROCRAFT][EVENT] type="limit_reached" userId=${userId} orgId=${orgId} tier="${tier}" dailyLimit=${tierLimits.dailyMessages} messagesUsed=${messagesToday}`);
              
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `Você atingiu o limite de ${tierLimits.dailyMessages} mensagens diárias do plano ${tier}. Faça upgrade para continuar conversando!`,
              });
            }
          }
          // =============================================
          
          // Save user message
          await db.saveMessage(userId, orgId, "user", input.message);

          // Prepare system prompt with user context
          const contextualPrompt = `${BROCRAFT_SYSTEM_PROMPT}

# CONTEXTO DO USUÁRIO
- Rank: ${userProfile.rank}
- XP: ${userProfile.xp}
- Tier: ${userProfile.tier}`;

          // Call LLM
          const response = await invokeLLM({
            messages: [
              { role: "system", content: contextualPrompt },
              { role: "user", content: input.message },
            ],
          });

          const assistantMessageContent = response.choices[0]?.message?.content;
          const assistantMessage = typeof assistantMessageContent === "string" 
            ? assistantMessageContent 
            : "Erro ao gerar resposta";
          
          // Save assistant message
          const xpGained = 10; // Base XP for chat
          await db.saveMessage(userId, orgId, "assistant", assistantMessage, xpGained);
          
          // Add XP and check for rank up
          const xpResult = await db.addXP(userId, orgId, xpGained);
          
          // Check and award badges
          const badgeResult = await db.checkAndAwardBadges(userId, orgId);

          // Retornar info de limite restante
          const newMessageCount = await db.countUserMessagesToday(userId, orgId);
          const messagesRemaining = tierLimits.dailyMessages === Infinity 
            ? null 
            : tierLimits.dailyMessages - newMessageCount;

          return {
            response: assistantMessage,
            xpGained,
            rankUp: xpResult.rankUp,
            newRank: xpResult.newRank,
            newBadges: badgeResult.newlyAwarded,
            messagesRemaining,
          };
        } catch (error) {
          console.error("Chat error:", error);
          throw error;
        }
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.getUserMessages(userId, orgId, input.limit, input.offset);
      }),
  }),

  // Gamification Router
  gamification: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const orgId = ctx.orgId;
      if (!userId || !orgId) throw new Error("User not authenticated");

      return db.getUserProfile(userId, orgId);
    }),

    addXP: protectedProcedure
      .input(z.object({ amount: z.number().positive() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.addXP(userId, orgId, input.amount);
      }),
    
    // Badges
    getBadges: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const orgId = ctx.orgId;
      if (!userId || !orgId) throw new Error("User not authenticated");

      return db.getUserBadges(userId, orgId);
    }),
    
    getAllBadgeDefinitions: publicProcedure.query(() => {
      return db.getAllBadgeDefinitions();
    }),
  }),

  // Recipes Router
  recipes: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        difficulty: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ input, ctx }) => {
        // For public recipes, use default org or require orgId in input
        // For now, we'll require orgId from context if user is authenticated, otherwise use default
        const orgId = ctx.orgId || await db.getDefaultOrgId();
        return db.getRecipes(orgId, input.category, input.difficulty, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const orgId = ctx.orgId || await db.getDefaultOrgId();
        return db.getRecipeById(input.id, orgId);
      }),

    userRecipes: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.getUserRecipes(userId, orgId, input.status);
      }),

    startRecipe: protectedProcedure
      .input(z.object({ recipeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.startRecipe(userId, orgId, input.recipeId);
      }),

    completeRecipe: protectedProcedure
      .input(z.object({
        userRecipeId: z.number(),
        rating: z.number().min(1).max(5),
        photo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        const result = await db.completeRecipe(userId, orgId, input.userRecipeId, input.rating, input.photo);
        
        // Check and award badges after completing recipe
        const badgeResult = await db.checkAndAwardBadges(userId, orgId);
        
        return {
          ...result,
          newBadges: badgeResult.newlyAwarded,
        };
      }),
  }),

  // Community Router
  community: router({
    // Lista posts com paginação cursor-based
    getPosts: publicProcedure
      .input(z.object({
        category: z.enum(COMMUNITY_CATEGORY_VALUES as [string, ...string[]]).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().nullish(), // ID do último post para paginação
      }))
      .query(async ({ input, ctx }) => {
        // Passa userId se autenticado para calcular hasVoted
        const currentUserId = ctx.user?.id;
        const orgId = ctx.orgId || await db.getDefaultOrgId();
        return db.getCommunityPosts(orgId, input.category, input.limit, input.cursor ?? undefined, currentUserId);
      }),

    createPost: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(5000).optional(),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        category: z.enum(COMMUNITY_CATEGORY_VALUES as [string, ...string[]]),
        recipeId: z.number().optional(),
        instagramUrl: z.string().url().optional(),
        tiktokUrl: z.string().url().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.createCommunityPost(userId, orgId, input);
      }),

    // Toggle de voto (vota/desvota)
    votePost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        voteType: z.enum(VOTE_TYPES as [string, ...string[]]).default("LIKE"),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.toggleVotePost(userId, orgId, input.postId, input.voteType);
      }),

    getLeaderboard: publicProcedure
      .input(z.object({
        category: z.enum(COMMUNITY_CATEGORY_VALUES as [string, ...string[]]).optional(),
        timeframe: z.enum(LEADERBOARD_TIMEFRAMES as [string, ...string[]]).default("ALL"),
      }))
      .query(async ({ input, ctx }) => {
        const orgId = ctx.orgId || await db.getDefaultOrgId();
        return db.getLeaderboard(orgId, input.category, input.timeframe);
      }),
  }),

  // Marketplace Router
  marketplace: router({
    getProducts: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        const orgId = ctx.orgId || await db.getDefaultOrgId();
        return db.getProducts(orgId, input.category, input.limit, input.offset);
      }),

    getCart: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const orgId = ctx.orgId;
      if (!userId || !orgId) throw new Error("User not authenticated");

      return db.getCart(userId, orgId);
    }),

    addToCart: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().positive().default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.addToCart(userId, orgId, input.productId, input.quantity);
      }),

    removeFromCart: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.removeFromCart(userId, orgId, input.cartItemId);
      }),

    checkout: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const orgId = ctx.orgId;
      if (!userId || !orgId) throw new Error("User not authenticated");

      return db.createOrder(userId, orgId);
    }),
  }),

  // Conversation History Router
  conversationHistory: router({
    save: protectedProcedure
      .input(z.object({
        title: z.string(),
        messages: z.array(z.object({
          role: z.string(),
          content: z.string(),
          timestamp: z.date(),
        })),
        xpGained: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.saveConversationHistory(userId, orgId, input.title, input.messages, input.xpGained);
      }),

    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.getConversationHistory(userId, orgId, input.limit, input.offset);
      }),

    getById: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.getConversationById(input.conversationId, userId, orgId);
      }),

    delete: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        if (!userId || !orgId) throw new Error("User not authenticated");

        return db.deleteConversation(input.conversationId, userId, orgId);
      }),
  }),

  // Billing Router (Stripe)
  billing: router({
    // Retorna informações de billing do usuário
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const orgId = ctx.orgId;
      if (!userId || !orgId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const tier = await db.getUserTier(userId, orgId);
      const purchases = await db.getUserPurchases(userId, orgId);

      return {
        tier,
        isStripeConfigured: isStripeConfigured(),
        purchases: purchases.map(p => ({
          id: p.id,
          tier: p.tier,
          status: p.status,
          amount: p.amount,
          createdAt: p.createdAt,
        })),
      };
    }),

    // Cria uma sessão de checkout do Stripe
    createCheckoutSession: protectedProcedure
      .input(z.object({
        tier: z.enum(["MESTRE", "CLUBE_BRO"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const orgId = ctx.orgId;
        const userEmail = ctx.user?.email;
        if (!userId || !orgId) throw new TRPCError({ code: "UNAUTHORIZED" });

        // Verificar se Stripe está configurado
        if (!isStripeConfigured()) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Sistema de pagamentos não configurado. Contate o suporte.",
          });
        }

        // Verificar se usuário já tem esse tier ou superior
        const currentTier = await db.getUserTier(userId, orgId);
        const tierOrder = { FREE: 0, MESTRE: 1, CLUBE_BRO: 2 };
        
        if (tierOrder[currentTier as keyof typeof tierOrder] >= tierOrder[input.tier]) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Você já possui o plano ${currentTier} ou superior.`,
          });
        }

        try {
          // Criar checkout session no Stripe
          const { url, sessionId } = await createCheckoutSessionForTier(
            userId,
            userEmail || null,
            input.tier
          );

          // Registrar compra como pendente
          await db.createPurchase({
            userId,
            orgId,
            tier: input.tier,
            stripeSessionId: sessionId,
            amount: STRIPE_PLANS[input.tier].price,
            status: "PENDING",
          });

          return { url };
        } catch (error) {
          console.error("[Billing] Error creating checkout:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar sessão de pagamento. Tente novamente.",
          });
        }
      }),

    // Retorna os planos disponíveis
    getPlans: publicProcedure.query(() => {
      return {
        MESTRE: {
          name: "Plano MESTRE",
          price: 990,
          priceFormatted: "R$ 9,90",
          period: "mês",
          features: [
            "Chat com IA (100 mensagens/dia)",
            "Receitas avançadas",
            "Badges exclusivos",
            "Comunidade",
          ],
        },
        CLUBE_BRO: {
          name: "Plano CLUBE BRO",
          price: 1990,
          priceFormatted: "R$ 19,90",
          period: "mês",
          features: [
            "Chat com IA (ilimitado)",
            "Todas as receitas premium",
            "Badges exclusivos",
            "Comunidade VIP",
            "Suporte prioritário",
          ],
        },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
