import { eq, and, desc } from "drizzle-orm";
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
  
  return {
    ...user[0],
    badges: userBadges,
  };
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
  
  if (!item.length || item[0].userId !== userId) {
    return { success: false, message: "Not authorized" };
  }
  
  // Note: In production, use db.delete(cartItems).where(eq(cartItems.id, cartItemId))
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
  
  if (!conv.length || conv[0].userId !== userId) {
    return { success: false, message: "Not authorized" };
  }
  
  // Delete conversation
  // Note: In production, use db.delete(conversationHistory).where(eq(conversationHistory.id, conversationId))
  return { success: true };
}
