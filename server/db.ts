/**
 * BROCRAFT Database Module
 * 
 * Contains all database operations using Drizzle ORM.
 * 
 * TELEMETRIA DE EVENTOS:
 * Este arquivo contém logs de eventos importantes no formato:
 * [BROCRAFT][EVENT] type="event_type" userId=X ...
 * 
 * Eventos rastreados:
 * - rank_up: Quando usuário sobe de rank
 * - recipe_completed: Quando usuário completa uma receita
 * - post_created: Quando usuário cria um post na comunidade
 * 
 * TODO: [PROD] Substituir logs de console por integração com sistema de analytics
 * (ex: Sentry, PostHog, Amplitude, ou serviço próprio de telemetria)
 */

import { eq, and, desc, gte, lt, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, messages, recipes, userRecipes, badges, communityPosts, votes, products, cartItems, orders, conversationHistory, InsertConversationHistory, purchases, organizations } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { LeaderboardTimeframe, CommunityCategory, VoteType } from "@shared/const";
import type { TierType } from "./_core/stripe";
import { ForbiddenError } from "@shared/_core/errors";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Helper to ensure a user belongs to the specified organization.
 * Throws ForbiddenError if user's orgId doesn't match.
 */
export async function ensureOrgOwnership(userId: number, orgId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user.length) {
    throw new Error("User not found");
  }
  
  if (user[0].orgId !== orgId) {
    throw ForbiddenError("User does not belong to this organization");
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  
  if (!user.orgId) {
    throw new Error("User orgId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      orgId: user.orgId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get or create default organization for seeding/migration purposes.
 * Returns the default organization ID.
 */
export async function getDefaultOrgId(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Fixed UUID for default org (matches migration and seed)
  const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
  
  const defaultOrg = await db.select()
    .from(organizations)
    .where(eq(organizations.id, DEFAULT_ORG_ID))
    .limit(1);
  
  if (defaultOrg.length > 0) {
    return defaultOrg[0].id;
  }
  
  // If not found, try by slug
  const defaultOrgBySlug = await db.select()
    .from(organizations)
    .where(eq(organizations.slug, "brocraft-community"))
    .limit(1);
  
  if (defaultOrgBySlug.length > 0) {
    return defaultOrgBySlug[0].id;
  }
  
  // If still not found, this should be created by seed script
  throw new Error("Default organization not found. Run seed script first.");
}

// ===== BROCRAFT SPECIFIC QUERIES =====

// Messages
export async function saveMessage(userId: number, orgId: string, role: string, content: string, xpGained: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const result = await db.insert(messages).values({
    userId,
    orgId,
    role,
    content,
    xpGained,
  });
  return result;
}

export async function getUserMessages(userId: number, orgId: string, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  return db.select()
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.orgId, orgId)))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

// Gamification
export async function addXP(userId: number, orgId: string, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const user = await db.select().from(users).where(and(eq(users.id, userId), eq(users.orgId, orgId))).limit(1);
  if (!user.length) throw new Error("User not found");
  
  const oldRank = user[0].rank;
  const newXP = user[0].xp + amount;
  const newRank = calculateRank(newXP);
  const rankUp = newRank !== oldRank;
  
  await db.update(users)
    .set({ xp: newXP, rank: newRank })
    .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
  
  // [BROCRAFT][EVENT] Telemetria de rank up
  if (rankUp) {
    console.log(`[BROCRAFT][EVENT] type="rank_up" userId=${userId} orgId=${orgId} oldRank="${oldRank}" newRank="${newRank}" totalXP=${newXP}`);
  }
  
  return { newXP, newRank, rankUp };
}

function calculateRank(xp: number) {
  if (xp >= 10000) return "LEGEND";
  if (xp >= 3000) return "ALQUIMISTA";
  if (xp >= 1000) return "MESTRE_DO_MALTE";
  if (xp >= 300) return "BRO_DA_PANELA";
  return "NOVATO";
}

export async function getUserProfile(userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const user = await db.select().from(users).where(and(eq(users.id, userId), eq(users.orgId, orgId))).limit(1);
  if (!user.length) throw new Error("User not found");
  
  const userBadges = await db.select().from(badges).where(and(eq(badges.userId, userId), eq(badges.orgId, orgId)));
  
  // Atualiza e calcula streak baseado na atividade
  const updatedStreak = await updateAndGetStreak(userId, orgId);
  
  return {
    ...user[0],
    streak: updatedStreak,
    badges: userBadges,
  };
}

// Streak System
function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}

async function hasActivityOnDate(userId: number, orgId: string, date: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const startOfDay = getStartOfDay(date);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  // Verifica mensagens no chat
  const chatMessages = await db.select({ id: messages.id })
    .from(messages)
    .where(and(
      eq(messages.userId, userId),
      eq(messages.orgId, orgId),
      gte(messages.createdAt, startOfDay),
      sql`${messages.createdAt} < ${endOfDay}`
    ))
    .limit(1);
  
  if (chatMessages.length > 0) return true;
  
  // Verifica receitas completadas
  const completedRecipes = await db.select({ id: userRecipes.id })
    .from(userRecipes)
    .where(and(
      eq(userRecipes.userId, userId),
      eq(userRecipes.orgId, orgId),
      eq(userRecipes.status, "COMPLETED"),
      gte(userRecipes.completedAt, startOfDay),
      sql`${userRecipes.completedAt} < ${endOfDay}`
    ))
    .limit(1);
  
  return completedRecipes.length > 0;
}

/**
 * Atualiza e retorna o streak do usuário.
 * 
 * TODO: [BETA] Considerar fuso horário do usuário para cálculo de streak
 * Atualmente usa horário do servidor (UTC ou local).
 * Pode causar bugs se o usuário estiver em fuso horário diferente.
 * Prioridade: BAIXA para beta, ALTA para produção global.
 * Solução: Adicionar campo timezone no user ou usar UTC consistente.
 */
export async function updateAndGetStreak(userId: number, orgId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  await ensureOrgOwnership(userId, orgId);
  
  const user = await db.select().from(users).where(and(eq(users.id, userId), eq(users.orgId, orgId))).limit(1);
  if (!user.length) return 0;
  
  const currentStreak = user[0].streak;
  const lastSignedIn = user[0].lastSignedIn;
  const today = getStartOfDay(new Date());
  const yesterday = getStartOfYesterday();
  
  // Verifica se já teve atividade hoje
  const hadActivityToday = await hasActivityOnDate(userId, orgId, new Date());
  
  // Se já teve atividade hoje, verifica se precisa incrementar o streak
  if (hadActivityToday) {
    // Verifica se o lastSignedIn foi antes de hoje (novo dia)
    const lastSignedInDay = getStartOfDay(lastSignedIn);
    
    if (lastSignedInDay.getTime() < today.getTime()) {
      // É um novo dia com atividade
      // Verifica se teve atividade ontem para continuar o streak
      const hadActivityYesterday = await hasActivityOnDate(userId, orgId, yesterday);
      
      let newStreak: number;
      if (hadActivityYesterday || lastSignedInDay.getTime() === yesterday.getTime()) {
        // Continua o streak
        newStreak = currentStreak + 1;
      } else {
        // Quebrou o streak, começa de 1
        newStreak = 1;
      }
      
      // Atualiza o streak e lastSignedIn
      await db.update(users)
        .set({ streak: newStreak, lastSignedIn: new Date() })
        .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
      
      return newStreak;
    }
    
    // Já atualizou hoje, retorna o streak atual
    return currentStreak > 0 ? currentStreak : 1;
  }
  
  // Sem atividade hoje ainda
  // Verifica se perdeu o streak (mais de 1 dia sem atividade)
  const lastActivityDay = getStartOfDay(lastSignedIn);
  const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity > 1) {
    // Perdeu o streak
    if (currentStreak > 0) {
      await db.update(users)
        .set({ streak: 0 })
        .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
    }
    return 0;
  }
  
  // Ainda está no mesmo dia ou dia seguinte (ainda pode manter)
  return currentStreak;
}

// Recipes
export async function getRecipes(orgId: string, category?: string, difficulty?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(recipes.orgId, orgId)];
  
  if (category) conditions.push(eq(recipes.category, category as any));
  if (difficulty) conditions.push(eq(recipes.difficulty, difficulty as any));
  
  return db.select().from(recipes).where(and(...conditions)).limit(limit);
}

export async function getRecipeById(id: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(recipes).where(and(eq(recipes.id, id), eq(recipes.orgId, orgId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserRecipes(userId: number, orgId: string, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const conditions = [eq(userRecipes.userId, userId), eq(userRecipes.orgId, orgId)];
  if (status) {
    conditions.push(eq(userRecipes.status, status as any));
  }
  
  return db.select().from(userRecipes).where(and(...conditions));
}

export async function startRecipe(userId: number, orgId: string, recipeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const recipe = await getRecipeById(recipeId, orgId);
  if (!recipe) throw new Error("Recipe not found");
  
  // Check if already started
  const existing = await db.select()
    .from(userRecipes)
    .where(and(eq(userRecipes.userId, userId), eq(userRecipes.orgId, orgId), eq(userRecipes.recipeId, recipeId)))
    .limit(1);
  
  if (existing.length) {
    return { success: false, message: "Recipe already started" };
  }
  
  await db.insert(userRecipes).values({
    userId,
    orgId,
    recipeId,
    status: "STARTED",
  });
  
  // Award XP
  const xpReward = Math.floor(recipe.xp * 0.5); // 50% of recipe XP for starting
  await addXP(userId, orgId, xpReward);
  
  return { success: true, xpGained: xpReward };
}

export async function completeRecipe(userId: number, orgId: string, userRecipeId: number, rating: number, photo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const userRecipe = await db.select()
    .from(userRecipes)
    .where(and(eq(userRecipes.id, userRecipeId), eq(userRecipes.orgId, orgId)))
    .limit(1);
  
  if (!userRecipe.length) throw new Error("User recipe not found");
  
  const recipe = await getRecipeById(userRecipe[0].recipeId, orgId);
  if (!recipe) throw new Error("Recipe not found");
  
  // Update user recipe
  await db.update(userRecipes)
    .set({
      status: "COMPLETED",
      rating,
      photo,
      completedAt: new Date(),
    })
    .where(and(eq(userRecipes.id, userRecipeId), eq(userRecipes.orgId, orgId)));
  
  // Award full XP
  const xpReward = recipe.xp;
  await addXP(userId, orgId, xpReward);
  
  // [BROCRAFT][EVENT] Telemetria de receita completada
  console.log(`[BROCRAFT][EVENT] type="recipe_completed" userId=${userId} orgId=${orgId} recipeId=${recipe.id} difficulty="${recipe.difficulty}" category="${recipe.category}" xpAwarded=${xpReward}`);
  
  return { success: true, xpGained: xpReward };
}

// Badges
export async function awardBadge(userId: number, orgId: string, type: string, name: string, description: string, icon: string, color: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Check if already has badge
  const existing = await db.select()
    .from(badges)
    .where(and(eq(badges.userId, userId), eq(badges.orgId, orgId), eq(badges.type, type)))
    .limit(1);
  
  if (existing.length) {
    return { success: false, message: "Badge already earned" };
  }
  
  await db.insert(badges).values({
    userId,
    orgId,
    type,
    name,
    description,
    icon,
    color,
  });
  
  return { success: true };
}

export async function getUserBadges(userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  return db.select().from(badges).where(and(eq(badges.userId, userId), eq(badges.orgId, orgId)));
}

// Badge Definitions (catálogo de badges disponíveis)
const BADGE_DEFINITIONS = {
  FIRST_CHAT: {
    type: "FIRST_CHAT",
    name: "Primeira Chama 🔥",
    description: "Enviou sua primeira mensagem no chat",
    icon: "🔥",
    color: "#FF6B00",
    criteria: (stats: UserStats) => stats.totalMessages >= 1,
  },
  TEN_CHATS: {
    type: "TEN_CHATS",
    name: "Bro Falante 💬",
    description: "Enviou 10 mensagens no chat",
    icon: "💬",
    color: "#3B82F6",
    criteria: (stats: UserStats) => stats.totalMessages >= 10,
  },
  FIFTY_CHATS: {
    type: "FIFTY_CHATS",
    name: "Mestre do Papo 🗣️",
    description: "Enviou 50 mensagens no chat",
    icon: "🗣️",
    color: "#8B5CF6",
    criteria: (stats: UserStats) => stats.totalMessages >= 50,
  },
  FIRST_RECIPE: {
    type: "FIRST_RECIPE",
    name: "Primeira Receita 📜",
    description: "Completou sua primeira receita",
    icon: "📜",
    color: "#10B981",
    criteria: (stats: UserStats) => stats.completedRecipes >= 1,
  },
  TEN_RECIPES: {
    type: "TEN_RECIPES",
    name: "Chef em Formação 👨‍🍳",
    description: "Completou 10 receitas",
    icon: "👨‍🍳",
    color: "#F59E0B",
    criteria: (stats: UserStats) => stats.completedRecipes >= 10,
  },
  FIRST_RANK_UP: {
    type: "FIRST_RANK_UP",
    name: "Subindo de Nível ⬆️",
    description: "Alcançou o rank Bro da Panela",
    icon: "⬆️",
    color: "#EF4444",
    criteria: (stats: UserStats) => stats.rank !== "NOVATO",
  },
  MESTRE_RANK: {
    type: "MESTRE_RANK",
    name: "Mestre do Malte 🍺",
    description: "Alcançou o rank Mestre do Malte",
    icon: "🍺",
    color: "#F59E0B",
    criteria: (stats: UserStats) => ["MESTRE_DO_MALTE", "ALQUIMISTA", "LEGEND"].includes(stats.rank),
  },
  STREAK_7: {
    type: "STREAK_7",
    name: "Uma Semana Fermentando 📅",
    description: "Manteve uma streak de 7 dias",
    icon: "📅",
    color: "#06B6D4",
    criteria: (stats: UserStats) => stats.streak >= 7,
  },
} as const;

type UserStats = {
  totalMessages: number;
  completedRecipes: number;
  xp: number;
  rank: string;
  streak: number;
};

export type AwardedBadge = {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export async function checkAndAwardBadges(userId: number, orgId: string): Promise<{ newlyAwarded: AwardedBadge[] }> {
  const db = await getDb();
  if (!db) {
    return { newlyAwarded: [] };
  }
  
  await ensureOrgOwnership(userId, orgId);
  
  try {
    // 1. Buscar dados do usuário
    const user = await db.select().from(users).where(and(eq(users.id, userId), eq(users.orgId, orgId))).limit(1);
    if (!user.length) {
      return { newlyAwarded: [] };
    }
    
    // 2. Contar mensagens
    const messageCountResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.orgId, orgId)));
    const totalMessages = Number(messageCountResult[0]?.count || 0);
    
    // 3. Contar receitas completadas
    const recipeCountResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(userRecipes)
      .where(and(
        eq(userRecipes.userId, userId),
        eq(userRecipes.orgId, orgId),
        eq(userRecipes.status, "COMPLETED")
      ));
    const completedRecipes = Number(recipeCountResult[0]?.count || 0);
    
    // 4. Montar stats do usuário
    const stats: UserStats = {
      totalMessages,
      completedRecipes,
      xp: user[0].xp,
      rank: user[0].rank,
      streak: user[0].streak,
    };
    
    // 5. Buscar badges que o usuário já tem
    const existingBadges = await db.select({ type: badges.type })
      .from(badges)
      .where(and(eq(badges.userId, userId), eq(badges.orgId, orgId)));
    const existingTypes = new Set(existingBadges.map(b => b.type));
    
    // 6. Verificar quais badges novos o usuário merece
    const newlyAwarded: AwardedBadge[] = [];
    
    for (const [key, badge] of Object.entries(BADGE_DEFINITIONS)) {
      // Pula se já tem
      if (existingTypes.has(badge.type)) continue;
      
      // Verifica critério
      if (badge.criteria(stats)) {
        // Concede o badge
        await db.insert(badges).values({
          userId,
          orgId,
          type: badge.type,
          name: badge.name,
          description: badge.description || "",
          icon: badge.icon,
          color: badge.color,
        });
        
        newlyAwarded.push({
          type: badge.type,
          name: badge.name,
          description: badge.description || "",
          icon: badge.icon,
          color: badge.color,
        });
      }
    }
    
    return { newlyAwarded };
  } catch (error) {
    console.error("[checkAndAwardBadges] Error:", error);
    return { newlyAwarded: [] };
  }
}

// Função para listar todos os badges disponíveis (para mostrar bloqueados)
export function getAllBadgeDefinitions() {
  return Object.values(BADGE_DEFINITIONS).map(badge => ({
    type: badge.type,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
  }));
}

// Community Posts - Com paginação cursor-based e hasVoted
export async function getCommunityPosts(
  orgId: string,
  category?: CommunityCategory,
  limit: number = 20,
  cursor?: number, // ID do último post (para paginação)
  currentUserId?: number // Para calcular hasVoted
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Construir condições
  const conditions: any[] = [eq(communityPosts.orgId, orgId)];
  if (category) conditions.push(eq(communityPosts.category, category as any));
  if (cursor) conditions.push(lt(communityPosts.id, cursor)); // Posts anteriores ao cursor
  
  // Buscar limit + 1 para saber se há mais
  const posts = await db.select({
    id: communityPosts.id,
    userId: communityPosts.userId,
    title: communityPosts.title,
    description: communityPosts.description,
    imageUrl: communityPosts.imageUrl,
    videoUrl: communityPosts.videoUrl,
    category: communityPosts.category,
    votes: communityPosts.votes,
    comments: communityPosts.comments,
    createdAt: communityPosts.createdAt,
    authorName: users.name,
  })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(communityPosts.id))
    .limit(limit + 1);
  
  // Verificar se há mais posts
  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;
  
  // Se usuário autenticado, buscar votos dele
  let userVotedPostIds: Set<number> = new Set();
  if (currentUserId && items.length > 0) {
    const postIds = items.map(p => p.id);
    const userVotes = await db.select({ postId: votes.postId })
      .from(votes)
      .where(and(
        eq(votes.userId, currentUserId),
        eq(votes.orgId, orgId),
        inArray(votes.postId, postIds)
      ));
    userVotedPostIds = new Set(userVotes.map(v => v.postId));
  }
  
  return {
    items: items.map(post => ({
      ...post,
      authorName: post.authorName || "Bro Anônimo",
      hasVoted: userVotedPostIds.has(post.id),
    })),
    nextCursor,
  };
}

export async function createCommunityPost(userId: number, orgId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Buscar nome do autor
  const user = await db.select({ name: users.name }).from(users).where(and(eq(users.id, userId), eq(users.orgId, orgId))).limit(1);
  const authorName = user[0]?.name || "Bro Anônimo";
  
  await db.insert(communityPosts).values({
    userId,
    orgId,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    category: data.category,
    recipeId: data.recipeId,
    instagramUrl: data.instagramUrl,
    tiktokUrl: data.tiktokUrl,
  });
  
  // Buscar o post recém-criado
  const newPost = await db.select()
    .from(communityPosts)
    .where(and(eq(communityPosts.userId, userId), eq(communityPosts.orgId, orgId)))
    .orderBy(desc(communityPosts.createdAt))
    .limit(1);
  
  // [BROCRAFT][EVENT] Telemetria de post criado
  console.log(`[BROCRAFT][EVENT] type="post_created" userId=${userId} orgId=${orgId} postId=${newPost[0]?.id} category="${data.category}"`);
  
  return {
    success: true,
    post: {
      ...newPost[0],
      authorName,
    },
  };
}

/**
 * Toggle de voto: se não votou, vota; se já votou, remove o voto.
 */
export async function toggleVotePost(userId: number, orgId: string, postId: number, voteType: VoteType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Verificar se post existe e pertence à mesma org
  const post = await db.select()
    .from(communityPosts)
    .where(and(eq(communityPosts.id, postId), eq(communityPosts.orgId, orgId)))
    .limit(1);
  
  if (!post.length) {
    return { success: false, message: "Post not found", newVoteCount: 0, hasVoted: false };
  }
  
  // Verificar se já votou
  const existing = await db.select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.orgId, orgId), eq(votes.postId, postId)))
    .limit(1);
  
  let newVoteCount = post[0].votes;
  let hasVoted: boolean;
  
  if (existing.length) {
    // Já votou → remover voto (toggle off)
    await db.delete(votes)
      .where(and(eq(votes.userId, userId), eq(votes.orgId, orgId), eq(votes.postId, postId)));
    
    newVoteCount = Math.max(0, post[0].votes - 1);
    hasVoted = false;
  } else {
    // Não votou → adicionar voto (toggle on)
    await db.insert(votes).values({
      userId,
      orgId,
      postId,
      voteType: voteType as any,
    });
    
    newVoteCount = post[0].votes + 1;
    hasVoted = true;
  }
  
  // Atualizar contagem no post
  await db.update(communityPosts)
    .set({ votes: newVoteCount })
    .where(and(eq(communityPosts.id, postId), eq(communityPosts.orgId, orgId)));
  
  return { 
    success: true, 
    newVoteCount, 
    hasVoted,
    action: hasVoted ? "voted" : "unvoted",
  };
}

// Legacy: mantido para compatibilidade (redirecionado para toggle)
export async function votePost(userId: number, orgId: string, postId: number, voteType: string) {
  return toggleVotePost(userId, orgId, postId, voteType as VoteType);
}

export async function getLeaderboard(orgId: string, category?: CommunityCategory, timeframe: LeaderboardTimeframe = "ALL") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calcular data de corte baseado no timeframe
  let fromDate: Date | null = null;
  const now = new Date();
  
  switch (timeframe) {
    case "DAY":
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "WEEK":
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "MONTH":
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "ALL":
    default:
      fromDate = null;
      break;
  }
  
  // Construir condições
  const conditions: any[] = [eq(communityPosts.orgId, orgId)];
  if (category) conditions.push(eq(communityPosts.category, category as any));
  if (fromDate) conditions.push(gte(communityPosts.createdAt, fromDate));
  
  // Query com JOIN para pegar nome do autor
  const leaderboard = await db.select({
    id: communityPosts.id,
    userId: communityPosts.userId,
    title: communityPosts.title,
    votes: communityPosts.votes,
    category: communityPosts.category,
    createdAt: communityPosts.createdAt,
    authorName: users.name,
  })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(communityPosts.votes))
    .limit(10);
  
  return leaderboard.map(post => ({
    ...post,
    authorName: post.authorName || "Bro Anônimo",
  }));
}

// Marketplace
export async function getProducts(orgId: string, category?: string, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(products.orgId, orgId)];
  if (category) {
    conditions.push(eq(products.category, category as any));
  }
  
  return db.select().from(products)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
}

export async function getCart(userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  return db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.orgId, orgId)));
}

export async function addToCart(userId: number, orgId: string, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Verify product belongs to same org
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.orgId, orgId))).limit(1);
  if (!product.length) throw new Error("Product not found");
  
  // Check if already in cart
  const existing = await db.select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.orgId, orgId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length) {
    // Update quantity
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
    return { success: true, message: "Quantity updated" };
  }
  
  // Add new item
  await db.insert(cartItems).values({
    userId,
    orgId,
    productId,
    quantity,
  });
  
  return { success: true };
}

export async function removeFromCart(userId: number, orgId: string, cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Verify ownership
  const item = await db.select()
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.orgId, orgId)))
    .limit(1);
  
  // Se o item não existe, retorna sucesso (idempotente)
  if (!item.length) {
    return { success: true, message: "Item already removed" };
  }
  
  // Verifica se pertence ao usuário
  if (item[0].userId !== userId) {
    return { success: false, message: "Not authorized" };
  }
  
  // Delete real do item do carrinho
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.orgId, orgId)));
  
  return { success: true };
}

export async function createOrder(userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Get cart items
  const cartItemsList = await getCart(userId, orgId);
  if (!cartItemsList.length) {
    return { success: false, message: "Cart is empty" };
  }
  
  // Calculate total
  let total = 0;
  const orderItems = [];
  
  for (const item of cartItemsList) {
    const product = await db.select().from(products).where(and(eq(products.id, item.productId), eq(products.orgId, orgId))).limit(1);
    if (product.length) {
      total += product[0].price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product[0].price,
      });
    }
  }
  
  // Create order
  await db.insert(orders).values({
    userId,
    orgId,
    total,
    status: "PENDING",
    items: JSON.stringify(orderItems),
  });
  
  return { success: true, total };
}


// Conversation History
export async function saveConversationHistory(
  userId: number,
  orgId: string,
  title: string,
  messages: Array<{ role: string; content: string; timestamp: Date }>,
  xpGained: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  await db.insert(conversationHistory).values({
    userId,
    orgId,
    title,
    messages: JSON.stringify(messages),
    messageCount: messages.length,
    xpGained,
  });
  
  return { success: true };
}

export async function getConversationHistory(userId: number, orgId: string, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const results = await db.select()
    .from(conversationHistory)
    .where(and(eq(conversationHistory.userId, userId), eq(conversationHistory.orgId, orgId)))
    .orderBy(desc(conversationHistory.createdAt))
    .limit(limit)
    .offset(offset);
  
  return results.map(conv => ({
    ...conv,
    messages: typeof conv.messages === 'string' ? JSON.parse(conv.messages) : conv.messages,
  }));
}

export async function getConversationById(conversationId: number, userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const result = await db.select()
    .from(conversationHistory)
    .where(and(eq(conversationHistory.id, conversationId), eq(conversationHistory.userId, userId), eq(conversationHistory.orgId, orgId)))
    .limit(1);
  
  if (!result.length) return null;
  
  return {
    ...result[0],
    messages: typeof result[0].messages === 'string' ? JSON.parse(result[0].messages) : result[0].messages,
  };
}

export async function deleteConversation(conversationId: number, userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  // Verify ownership
  const conv = await db.select()
    .from(conversationHistory)
    .where(and(eq(conversationHistory.id, conversationId), eq(conversationHistory.orgId, orgId)))
    .limit(1);
  
  // Se a conversa não existe, retorna sucesso (idempotente)
  if (!conv.length) {
    return { success: true, message: "Conversation already deleted" };
  }
  
  // Verifica se pertence ao usuário
  if (conv[0].userId !== userId) {
    return { success: false, message: "Not authorized" };
  }
  
  // Delete real da conversa
  await db.delete(conversationHistory).where(and(eq(conversationHistory.id, conversationId), eq(conversationHistory.orgId, orgId)));
  
  return { success: true };
}

// =============================================
// BILLING / STRIPE
// =============================================

/**
 * Retorna o tier atual do usuário
 */
export async function getUserTier(userId: number, orgId: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  const user = await db.select({ tier: users.tier })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.orgId, orgId)))
    .limit(1);
  
  return user[0]?.tier || "FREE";
}

/**
 * Atualiza o tier do usuário
 */
export async function updateUserTier(userId: number, orgId: string, tier: TierType | "FREE"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  await db.update(users)
    .set({ tier: tier as any })
    .where(and(eq(users.id, userId), eq(users.orgId, orgId)));
  
  console.log(`[DB] User ${userId} orgId=${orgId} tier updated to ${tier}`);
}

/**
 * Cria um registro de compra (purchase)
 */
export async function createPurchase(data: {
  userId: number;
  orgId: string;
  tier: TierType;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  amount: number;
  status?: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(data.userId, data.orgId);
  
  const result = await db.insert(purchases).values({
    userId: data.userId,
    orgId: data.orgId,
    tier: data.tier as any,
    stripeSessionId: data.stripeSessionId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    stripeCustomerId: data.stripeCustomerId,
    amount: data.amount,
    status: (data.status || "PENDING") as any,
  });
  
  // Retorna o ID inserido
  return Number(result[0].insertId);
}

/**
 * Atualiza o status de uma compra
 */
export async function updatePurchaseStatus(
  stripeSessionId: string,
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED",
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (stripeSubscriptionId) updateData.stripeSubscriptionId = stripeSubscriptionId;
  if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
  
  await db.update(purchases)
    .set(updateData)
    .where(eq(purchases.stripeSessionId, stripeSessionId));
}

/**
 * Busca uma compra pelo Stripe Session ID
 */
export async function getPurchaseBySessionId(stripeSessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, stripeSessionId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Lista compras de um usuário
 */
export async function getUserPurchases(userId: number, orgId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await ensureOrgOwnership(userId, orgId);
  
  return db.select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.orgId, orgId)))
    .orderBy(desc(purchases.createdAt));
}

/**
 * Conta mensagens do usuário hoje (para paywall de limites)
 */
export async function countUserMessagesToday(userId: number, orgId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  await ensureOrgOwnership(userId, orgId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(messages)
    .where(and(
      eq(messages.userId, userId),
      eq(messages.orgId, orgId),
      eq(messages.role, "user"),
      gte(messages.createdAt, today)
    ));
  
  return Number(result[0]?.count || 0);
}

// Limites por tier
export const TIER_LIMITS = {
  FREE: {
    dailyMessages: 10,
    recipesAccess: "basic", // apenas básicas
  },
  MESTRE: {
    dailyMessages: 100,
    recipesAccess: "advanced", // básicas + avançadas
  },
  CLUBE_BRO: {
    dailyMessages: Infinity,
    recipesAccess: "all", // todas
  },
} as const;
