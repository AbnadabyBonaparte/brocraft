import { integer, pgEnum, pgTable, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// PostgreSQL Enums
export const roleEnum = pgEnum("role_enum", ["user", "admin"]);
export const rankEnum = pgEnum("rank_enum", ["NOVATO", "BRO_DA_PANELA", "MESTRE_DO_MALTE", "ALQUIMISTA", "LEGEND"]);
export const tierEnum = pgEnum("tier_enum", ["FREE", "MESTRE", "CLUBE_BRO"]);
export const recipeCategoryEnum = pgEnum("recipe_category_enum", ["CERVEJA", "FERMENTADOS", "LATICINIOS", "CHARCUTARIA", "DESTILADOS"]);
export const difficultyEnum = pgEnum("difficulty_enum", ["RAJADO", "CLASSICO", "MESTRE"]);
export const recipeStatusEnum = pgEnum("recipe_status_enum", ["STARTED", "IN_PROGRESS", "COMPLETED", "FAILED"]);
export const communityCategoryEnum = pgEnum("community_category_enum", ["CERVEJA", "FERMENTADOS", "LATICINIOS", "CHARCUTARIA", "DICA", "OUTRO"]);
export const voteTypeEnum = pgEnum("vote_type_enum", ["LIKE", "FIRE", "STAR"]);
export const productCategoryEnum = pgEnum("product_category_enum", ["FERMENTO", "COALHO", "LUPULO", "MALTE", "EQUIPAMENTO", "KIT"]);
export const orderStatusEnum = pgEnum("order_status_enum", ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]);
export const purchaseTierEnum = pgEnum("purchase_tier_enum", ["MESTRE", "CLUBE_BRO"]);
export const purchaseStatusEnum = pgEnum("purchase_status_enum", ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"]);

// Organizations
export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  xp: integer("xp").default(0).notNull(),
  rank: rankEnum("rank").default("NOVATO").notNull(),
  tier: tierEnum("tier").default("FREE").notNull(),
  streak: integer("streak").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  xpGained: integer("xpGained").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Recipes
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  category: recipeCategoryEnum("category").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  description: text("description").notNull(),
  rajado: jsonb("rajado"),
  classico: jsonb("classico"),
  mestre: jsonb("mestre"),
  macete: text("macete"),
  xp: integer("xp").default(50).notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  warnings: jsonb("warnings"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

// User Recipes
export const userRecipes = pgTable("userRecipes", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  recipeId: integer("recipeId").notNull(),
  status: recipeStatusEnum("status").default("STARTED").notNull(),
  photo: varchar("photo", { length: 512 }),
  notes: text("notes"),
  rating: integer("rating"),
  startedAt: timestamp("startedAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type UserRecipe = typeof userRecipes.$inferSelect;
export type InsertUserRecipe = typeof userRecipes.$inferInsert;

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  earnedAt: timestamp("earnedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// Community Posts
export const communityPosts = pgTable("communityPosts", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  recipeId: integer("recipeId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  category: communityCategoryEnum("category").notNull(),
  votes: integer("votes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  tiktokUrl: varchar("tiktokUrl", { length: 512 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// Votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  postId: integer("postId").notNull(),
  voteType: voteTypeEnum("voteType").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  category: productCategoryEnum("category").notNull(),
  price: integer("price").notNull(),
  stock: integer("stock").default(0).notNull(),
  rating: integer("rating").default(0).notNull(),
  reviews: integer("reviews").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Cart Items
export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  total: integer("total").notNull(),
  status: orderStatusEnum("status").default("PENDING").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  items: jsonb("items"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Conversation History
export const conversationHistory = pgTable("conversationHistory", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  messages: jsonb("messages").notNull(),
  messageCount: integer("messageCount").default(0).notNull(),
  xpGained: integer("xpGained").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertConversationHistory = typeof conversationHistory.$inferInsert;

// Purchases
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  orgId: varchar("orgId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  tier: purchaseTierEnum("tier").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  status: purchaseStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// ============ RELATIONS ============

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
