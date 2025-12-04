import { eq, and, desc, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, messages, recipes, userRecipes, badges, communityPosts, votes, products, cartItems, orders, conversationHistory, InsertConversationHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
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

// ===== BROCRAFT SPECIFIC QUERIES =====

// Messages
export async function saveMessage(userId: number, role: string, content: string, xpGained: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values({
    userId,
    role,
    content,
    xpGained,
  });
  return result;
}

export async function getUserMessages(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

// Gamification
export async function addXP(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) throw new Error("User not found");
  
  const newXP = user[0].xp + amount;
  const newRank = calculateRank(newXP);
  
  await db.update(users)
    .set({ xp: newXP, rank: newRank })
    .where(eq(users.id, userId));
  
  return { newXP, newRank, rankUp: newRank !== user[0].rank };
}

function calculateRank(xp: number) {
  if (xp >= 10000) return "LEGEND";
  if (xp >= 3000) return "ALQUIMISTA";
  if (xp >= 1000) return "MESTRE_DO_MALTE";
  if (xp >= 300) return "BRO_DA_PANELA";
  return "NOVATO";
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) throw new Error("User not found");
  
  const userBadges = await db.select().from(badges).where(eq(badges.userId, userId));
  
  // Atualiza e calcula streak baseado na atividade
  const updatedStreak = await updateAndGetStreak(userId);
  
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

async function hasActivityOnDate(userId: number, date: Date): Promise<boolean> {
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
      eq(userRecipes.status, "COMPLETED"),
      gte(userRecipes.completedAt, startOfDay),
      sql`${userRecipes.completedAt} < ${endOfDay}`
    ))
    .limit(1);
  
  return completedRecipes.length > 0;
}

export async function updateAndGetStreak(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) return 0;
  
  const currentStreak = user[0].streak;
  const lastSignedIn = user[0].lastSignedIn;
  const today = getStartOfDay(new Date());
  const yesterday = getStartOfYesterday();
  
  // Verifica se já teve atividade hoje
  const hadActivityToday = await hasActivityOnDate(userId, new Date());
  
  // Se já teve atividade hoje, verifica se precisa incrementar o streak
  if (hadActivityToday) {
    // Verifica se o lastSignedIn foi antes de hoje (novo dia)
    const lastSignedInDay = getStartOfDay(lastSignedIn);
    
    if (lastSignedInDay.getTime() < today.getTime()) {
      // É um novo dia com atividade
      // Verifica se teve atividade ontem para continuar o streak
      const hadActivityYesterday = await hasActivityOnDate(userId, yesterday);
      
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
        .where(eq(users.id, userId));
      
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
        .where(eq(users.id, userId));
    }
    return 0;
  }
  
  // Ainda está no mesmo dia ou dia seguinte (ainda pode manter)
  return currentStreak;
}

// Recipes
export async function getRecipes(category?: string, difficulty?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [];
  
  if (category) conditions.push(eq(recipes.category, category as any));
  if (difficulty) conditions.push(eq(recipes.difficulty, difficulty as any));
  
  if (conditions.length > 0) {
    return db.select().from(recipes).where(and(...conditions)).limit(limit);
  }
  
  return db.select().from(recipes).limit(limit);
}

export async function getRecipeById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserRecipes(userId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (status) {
    return db.select().from(userRecipes).where(and(eq(userRecipes.userId, userId), eq(userRecipes.status, status as any)));
  }
  
  return db.select().from(userRecipes).where(eq(userRecipes.userId, userId));
}

export async function startRecipe(userId: number, recipeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const recipe = await getRecipeById(recipeId);
  if (!recipe) throw new Error("Recipe not found");
  
  // Check if already started
  const existing = await db.select()
    .from(userRecipes)
    .where(and(eq(userRecipes.userId, userId), eq(userRecipes.recipeId, recipeId)))
    .limit(1);
  
  if (existing.length) {
    return { success: false, message: "Recipe already started" };
  }
  
  await db.insert(userRecipes).values({
    userId,
    recipeId,
    status: "STARTED",
  });
  
  // Award XP
  const xpReward = Math.floor(recipe.xp * 0.5); // 50% of recipe XP for starting
  await addXP(userId, xpReward);
  
  return { success: true, xpGained: xpReward };
}

export async function completeRecipe(userId: number, userRecipeId: number, rating: number, photo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userRecipe = await db.select()
    .from(userRecipes)
    .where(eq(userRecipes.id, userRecipeId))
    .limit(1);
  
  if (!userRecipe.length) throw new Error("User recipe not found");
  
  const recipe = await getRecipeById(userRecipe[0].recipeId);
  if (!recipe) throw new Error("Recipe not found");
  
  // Update user recipe
  await db.update(userRecipes)
    .set({
      status: "COMPLETED",
      rating,
      photo,
      completedAt: new Date(),
    })
    .where(eq(userRecipes.id, userRecipeId));
  
  // Award full XP
  const xpReward = recipe.xp;
  await addXP(userId, xpReward);
  
  // Check for badges (future enhancement)
  
  return { success: true, xpGained: xpReward };
}

// Badges
export async function awardBadge(userId: number, type: string, name: string, description: string, icon: string, color: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already has badge
  const existing = await db.select()
    .from(badges)
    .where(and(eq(badges.userId, userId), eq(badges.type, type)))
    .limit(1);
  
  if (existing.length) {
    return { success: false, message: "Badge already earned" };
  }
  
  await db.insert(badges).values({
    userId,
    type,
    name,
    description,
    icon,
    color,
  });
  
  return { success: true };
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(badges).where(eq(badges.userId, userId));
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

export async function checkAndAwardBadges(userId: number): Promise<{ newlyAwarded: AwardedBadge[] }> {
  const db = await getDb();
  if (!db) {
    return { newlyAwarded: [] };
  }
  
  try {
    // 1. Buscar dados do usuário
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return { newlyAwarded: [] };
    }
    
    // 2. Contar mensagens
    const messageCountResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(eq(messages.userId, userId));
    const totalMessages = Number(messageCountResult[0]?.count || 0);
    
    // 3. Contar receitas completadas
    const recipeCountResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(userRecipes)
      .where(and(
        eq(userRecipes.userId, userId),
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
      .where(eq(badges.userId, userId));
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

// Community Posts
export async function getCommunityPosts(category?: string, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (category) {
    return db.select().from(communityPosts)
      .where(eq(communityPosts.category, category as any))
      .orderBy(desc(communityPosts.votes))
      .limit(limit)
      .offset(offset);
  }
  
  return db.select().from(communityPosts)
    .orderBy(desc(communityPosts.votes))
    .limit(limit)
    .offset(offset);
}

export async function createCommunityPost(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(communityPosts).values({
    userId,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    category: data.category,
    recipeId: data.recipeId,
    instagramUrl: data.instagramUrl,
    tiktokUrl: data.tiktokUrl,
  });
  
  return result;
}

export async function votePost(userId: number, postId: number, voteType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already voted
  const existing = await db.select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.postId, postId)))
    .limit(1);
  
  if (existing.length) {
    return { success: false, message: "Already voted" };
  }
  
  // Add vote
  await db.insert(votes).values({
    userId,
    postId,
    voteType: voteType as any,
  });
  
  // Update post vote count
  const post = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
  if (post.length) {
    await db.update(communityPosts)
      .set({ votes: post[0].votes + 1 })
      .where(eq(communityPosts.id, postId));
  }
  
  return { success: true };
}

export async function getLeaderboard(category?: string, timeframe: string = "WEEK") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // For now, return top posts by votes
  if (category) {
    return db.select().from(communityPosts)
      .where(eq(communityPosts.category, category as any))
      .orderBy(desc(communityPosts.votes))
      .limit(10);
  }
  
  return db.select().from(communityPosts)
    .orderBy(desc(communityPosts.votes))
    .limit(10);
}

// Marketplace
export async function getProducts(category?: string, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (category) {
    return db.select().from(products)
      .where(eq(products.category, category as any))
      .limit(limit)
      .offset(offset);
  }
  
  return db.select().from(products)
    .limit(limit)
    .offset(offset);
}

export async function getCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(cartItems)
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already in cart
  const existing = await db.select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
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
    productId,
    quantity,
  });
  
  return { success: true };
}

export async function removeFromCart(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership
  const item = await db.select()
    .from(cartItems)
    .where(eq(cartItems.id, cartItemId))
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
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  
  return { success: true };
}

export async function createOrder(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get cart items
  const cartItemsList = await getCart(userId);
  if (!cartItemsList.length) {
    return { success: false, message: "Cart is empty" };
  }
  
  // Calculate total
  let total = 0;
  const orderItems = [];
  
  for (const item of cartItemsList) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
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
    total,
    status: "PENDING",
    items: JSON.stringify(orderItems),
  });
  
  return { success: true, total };
}


// Conversation History
export async function saveConversationHistory(
  userId: number,
  title: string,
  messages: Array<{ role: string; content: string; timestamp: Date }>,
  xpGained: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(conversationHistory).values({
    userId,
    title,
    messages: JSON.stringify(messages),
    messageCount: messages.length,
    xpGained,
  });
  
  return { success: true };
}

export async function getConversationHistory(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db.select()
    .from(conversationHistory)
    .where(eq(conversationHistory.userId, userId))
    .orderBy(desc(conversationHistory.createdAt))
    .limit(limit)
    .offset(offset);
  
  return results.map(conv => ({
    ...conv,
    messages: typeof conv.messages === 'string' ? JSON.parse(conv.messages) : conv.messages,
  }));
}

export async function getConversationById(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(conversationHistory)
    .where(and(eq(conversationHistory.id, conversationId), eq(conversationHistory.userId, userId)))
    .limit(1);
  
  if (!result.length) return null;
  
  return {
    ...result[0],
    messages: typeof result[0].messages === 'string' ? JSON.parse(result[0].messages) : result[0].messages,
  };
}

export async function deleteConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership
  const conv = await db.select()
    .from(conversationHistory)
    .where(eq(conversationHistory.id, conversationId))
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
  await db.delete(conversationHistory).where(eq(conversationHistory.id, conversationId));
  
  return { success: true };
}
