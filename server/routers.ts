import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

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
        if (!userId) throw new Error("User not authenticated");

        try {
          // Get user profile for context
          const userProfile = await db.getUserProfile(userId);
          
          // Save user message
          await db.saveMessage(userId, "user", input.message);

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
          await db.saveMessage(userId, "assistant", assistantMessage, xpGained);
          
          // Add XP and check for rank up
          const xpResult = await db.addXP(userId, xpGained);
          
          // Check and award badges
          const badgeResult = await db.checkAndAwardBadges(userId);

          return {
            response: assistantMessage,
            xpGained,
            rankUp: xpResult.rankUp,
            newRank: xpResult.newRank,
            newBadges: badgeResult.newlyAwarded,
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
        if (!userId) throw new Error("User not authenticated");

        return db.getUserMessages(userId, input.limit, input.offset);
      }),
  }),

  // Gamification Router
  gamification: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      return db.getUserProfile(userId);
    }),

    addXP: protectedProcedure
      .input(z.object({ amount: z.number().positive() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.addXP(userId, input.amount);
      }),
    
    // Badges
    getBadges: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      return db.getUserBadges(userId);
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
      .query(async ({ input }) => {
        return db.getRecipes(input.category, input.difficulty, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getRecipeById(input.id);
      }),

    userRecipes: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.getUserRecipes(userId, input.status);
      }),

    startRecipe: protectedProcedure
      .input(z.object({ recipeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.startRecipe(userId, input.recipeId);
      }),

    completeRecipe: protectedProcedure
      .input(z.object({
        userRecipeId: z.number(),
        rating: z.number().min(1).max(5),
        photo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        const result = await db.completeRecipe(userId, input.userRecipeId, input.rating, input.photo);
        
        // Check and award badges after completing recipe
        const badgeResult = await db.checkAndAwardBadges(userId);
        
        return {
          ...result,
          newBadges: badgeResult.newlyAwarded,
        };
      }),
  }),

  // Community Router
  community: router({
    getPosts: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getCommunityPosts(input.category, input.limit, input.offset);
      }),

    createPost: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        category: z.string(),
        recipeId: z.number().optional(),
        instagramUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.createCommunityPost(userId, input);
      }),

    votePost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        voteType: z.enum(["LIKE", "FIRE", "STAR"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.votePost(userId, input.postId, input.voteType);
      }),

    getLeaderboard: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        timeframe: z.enum(["DAY", "WEEK", "MONTH", "ALL"]).default("WEEK"),
      }))
      .query(async ({ input }) => {
        return db.getLeaderboard(input.category, input.timeframe);
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
      .query(async ({ input }) => {
        return db.getProducts(input.category, input.limit, input.offset);
      }),

    getCart: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      return db.getCart(userId);
    }),

    addToCart: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().positive().default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.addToCart(userId, input.productId, input.quantity);
      }),

    removeFromCart: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.removeFromCart(userId, input.cartItemId);
      }),

    checkout: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      return db.createOrder(userId);
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
        if (!userId) throw new Error("User not authenticated");

        return db.saveConversationHistory(userId, input.title, input.messages, input.xpGained);
      }),

    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.getConversationHistory(userId, input.limit, input.offset);
      }),

    getById: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.getConversationById(input.conversationId, userId);
      }),

    delete: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("User not authenticated");

        return db.deleteConversation(input.conversationId, userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
