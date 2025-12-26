-- Multi-Tenant Foundation Migration
-- Adds organizations table and orgId to all relevant tables

-- Create organizations table
CREATE TABLE `organizations` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint

-- Create default organization first (will be seeded properly later)
-- Using a fixed UUID for default org
INSERT IGNORE INTO `organizations` (`id`, `name`, `slug`, `createdAt`) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Brocraft Community', 'brocraft-community', NOW());
--> statement-breakpoint

-- Add orgId to users table (nullable first, then populate, then make NOT NULL)
ALTER TABLE `users` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `users` SET `orgId` = '00000000-0000-0000-0000-000000000001' WHERE `orgId` IS NULL;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to messages table (nullable first, populate, then NOT NULL)
ALTER TABLE `messages` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `messages` m 
INNER JOIN `users` u ON m.userId = u.id 
SET m.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to recipes table
ALTER TABLE `recipes` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `recipes` SET `orgId` = '00000000-0000-0000-0000-000000000001' WHERE `orgId` IS NULL;
--> statement-breakpoint
ALTER TABLE `recipes` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to userRecipes table
ALTER TABLE `userRecipes` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `userRecipes` ur 
INNER JOIN `users` u ON ur.userId = u.id 
SET ur.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `userRecipes` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to badges table
ALTER TABLE `badges` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `badges` b 
INNER JOIN `users` u ON b.userId = u.id 
SET b.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `badges` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to communityPosts table
ALTER TABLE `communityPosts` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `communityPosts` cp 
INNER JOIN `users` u ON cp.userId = u.id 
SET cp.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `communityPosts` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to votes table
ALTER TABLE `votes` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `votes` v 
INNER JOIN `users` u ON v.userId = u.id 
SET v.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `votes` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to products table
ALTER TABLE `products` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `products` SET `orgId` = '00000000-0000-0000-0000-000000000001' WHERE `orgId` IS NULL;
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to cartItems table
ALTER TABLE `cartItems` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `cartItems` ci 
INNER JOIN `users` u ON ci.userId = u.id 
SET ci.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `cartItems` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to orders table
ALTER TABLE `orders` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `orders` o 
INNER JOIN `users` u ON o.userId = u.id 
SET o.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to conversationHistory table
ALTER TABLE `conversationHistory` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `conversationHistory` ch 
INNER JOIN `users` u ON ch.userId = u.id 
SET ch.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `conversationHistory` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Add orgId to purchases table
ALTER TABLE `purchases` ADD COLUMN `orgId` varchar(36) NULL;
--> statement-breakpoint
UPDATE `purchases` p 
INNER JOIN `users` u ON p.userId = u.id 
SET p.orgId = COALESCE(u.orgId, '00000000-0000-0000-0000-000000000001');
--> statement-breakpoint
ALTER TABLE `purchases` MODIFY COLUMN `orgId` varchar(36) NOT NULL;
--> statement-breakpoint

-- Create indexes for orgId columns (for performance)
CREATE INDEX `users_orgId_idx` ON `users`(`orgId`);
--> statement-breakpoint
CREATE INDEX `messages_orgId_idx` ON `messages`(`orgId`);
--> statement-breakpoint
CREATE INDEX `recipes_orgId_idx` ON `recipes`(`orgId`);
--> statement-breakpoint
CREATE INDEX `userRecipes_orgId_idx` ON `userRecipes`(`orgId`);
--> statement-breakpoint
CREATE INDEX `badges_orgId_idx` ON `badges`(`orgId`);
--> statement-breakpoint
CREATE INDEX `communityPosts_orgId_idx` ON `communityPosts`(`orgId`);
--> statement-breakpoint
CREATE INDEX `votes_orgId_idx` ON `votes`(`orgId`);
--> statement-breakpoint
CREATE INDEX `products_orgId_idx` ON `products`(`orgId`);
--> statement-breakpoint
CREATE INDEX `cartItems_orgId_idx` ON `cartItems`(`orgId`);
--> statement-breakpoint
CREATE INDEX `orders_orgId_idx` ON `orders`(`orgId`);
--> statement-breakpoint
CREATE INDEX `conversationHistory_orgId_idx` ON `conversationHistory`(`orgId`);
--> statement-breakpoint
CREATE INDEX `purchases_orgId_idx` ON `purchases`(`orgId`);
--> statement-breakpoint

-- Add foreign key constraints (MySQL InnoDB supports this)
-- Note: Foreign keys will be enforced at application level for better flexibility
-- But we add them here for data integrity

ALTER TABLE `users` ADD CONSTRAINT `users_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `userRecipes` ADD CONSTRAINT `userRecipes_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `badges` ADD CONSTRAINT `badges_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `communityPosts` ADD CONSTRAINT `communityPosts_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `cartItems` ADD CONSTRAINT `cartItems_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `conversationHistory` ADD CONSTRAINT `conversationHistory_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_orgId_organizations_id_fk` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

