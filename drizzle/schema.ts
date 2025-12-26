import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Organizations table for multi-tenant isolation.
 * Each organization is completely isolated from others.
 */
export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID stored as varchar(36)
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Core user table backing auth flow.
 * Extended with gamification fields for BROCRAFT.
 * Multi-tenant: each user belongs to an organization.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Gamification fields
  xp: int("xp").default(0).notNull(),
  rank: mysqlEnum("rank", ["NOVATO", "BRO_DA_PANELA", "MESTRE_DO_MALTE", "ALQUIMISTA", "LEGEND"]).default("NOVATO").notNull(),
  tier: mysqlEnum("tier", ["FREE", "MESTRE", "CLUBE_BRO"]).default("FREE").notNull(),
  streak: int("streak").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Messages table for chat history
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  xpGained: int("xpGained").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Recipes table
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(), // Unique per org (enforced at application level)
  category: mysqlEnum("category", ["CERVEJA", "FERMENTADOS", "LATICINIOS", "CHARCUTARIA", "DESTILADOS"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["RAJADO", "CLASSICO", "MESTRE"]).notNull(),
  description: text("description").notNull(),
  
  // Structured recipe content (JSON)
  rajado: json("rajado"),
  classico: json("classico"),
  mestre: json("mestre"),
  macete: text("macete"),
  
  xp: int("xp").default(50).notNull(),
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  
  // Warnings (stored as JSON array)
  warnings: json("warnings"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

// User recipes (tracking user progress)
export const userRecipes = mysqlTable("userRecipes", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  recipeId: int("recipeId").notNull(),
  
  status: mysqlEnum("status", ["STARTED", "IN_PROGRESS", "COMPLETED", "FAILED"]).default("STARTED").notNull(),
  photo: varchar("photo", { length: 512 }),
  notes: text("notes"),
  rating: int("rating"),
  
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type UserRecipe = typeof userRecipes.$inferSelect;
export type InsertUserRecipe = typeof userRecipes.$inferInsert;

// Badges table
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  
  type: varchar("type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  messages: many(messages),
  recipes: many(recipes),
  userRecipes: many(userRecipes),
  badges: many(badges),
  communityPosts: many(communityPosts),
  votes: many(votes),
  products: many(products),
  cartItems: many(cartItems),
  orders: many(orders),
  conversationHistory: many(conversationHistory),
  purchases: many(purchases),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  messages: many(messages),
  userRecipes: many(userRecipes),
  badges: many(badges),
  communityPosts: many(communityPosts),
  votes: many(votes),
  cartItems: many(cartItems),
  orders: many(orders),
  conversationHistory: many(conversationHistory),
  purchases: many(purchases),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  organization: one(organizations, {
    fields: [messages.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const userRecipesRelations = relations(userRecipes, ({ one }) => ({
  organization: one(organizations, {
    fields: [userRecipes.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [userRecipes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [userRecipes.recipeId],
    references: [recipes.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  organization: one(organizations, {
    fields: [badges.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [recipes.orgId],
    references: [organizations.id],
  }),
  userRecipes: many(userRecipes),
}));

// Community posts table
export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  recipeId: int("recipeId"),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  
  category: mysqlEnum("category", ["CERVEJA", "FERMENTADOS", "LATICINIOS", "CHARCUTARIA", "DICA", "OUTRO"]).notNull(),
  
  votes: int("votes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  tiktokUrl: varchar("tiktokUrl", { length: 512 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// Votes table for ranking
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  postId: int("postId").notNull(),
  
  voteType: mysqlEnum("voteType", ["LIKE", "FIRE", "STAR"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

// Marketplace products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  
  category: mysqlEnum("category", ["FERMENTO", "COALHO", "LUPULO", "MALTE", "EQUIPAMENTO", "KIT"]).notNull(),
  
  price: int("price").notNull(), // em centavos (R$ 9.90 = 990)
  stock: int("stock").default(0).notNull(),
  
  rating: int("rating").default(0).notNull(),
  reviews: int("reviews").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Cart items
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  
  quantity: int("quantity").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  
  total: int("total").notNull(), // em centavos
  status: mysqlEnum("status", ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]).default("PENDING").notNull(),
  
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  items: json("items"), // array of {productId, quantity, price}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Conversation history table
export const conversationHistory = mysqlTable("conversationHistory", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  messages: json("messages").notNull(),
  
  messageCount: int("messageCount").default(0).notNull(),
  xpGained: int("xpGained").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertConversationHistory = typeof conversationHistory.$inferInsert;

// Purchases table (tier upgrades via Stripe)
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(), // FK to organizations.id
  userId: int("userId").notNull(),
  
  tier: mysqlEnum("tier", ["MESTRE", "CLUBE_BRO"]).notNull(),
  
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  
  amount: int("amount").notNull(), // em centavos
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  
  status: mysqlEnum("status", ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"]).default("PENDING").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// Relations for community posts
export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [communityPosts.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [communityPosts.recipeId],
    references: [recipes.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  organization: one(organizations, {
    fields: [votes.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [votes.postId],
    references: [communityPosts.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [products.orgId],
    references: [organizations.id],
  }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  organization: one(organizations, {
    fields: [cartItems.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  organization: one(organizations, {
    fields: [orders.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

// Conversation history relations
export const conversationHistoryRelations = relations(conversationHistory, ({ one }) => ({
  organization: one(organizations, {
    fields: [conversationHistory.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [conversationHistory.userId],
    references: [users.id],
  }),
}));

// Purchases relations
export const purchasesRelations = relations(purchases, ({ one }) => ({
  organization: one(organizations, {
    fields: [purchases.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));
