CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(7),
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`xpGained` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category` enum('CERVEJA','FERMENTADOS','LATICINIOS','CHARCUTARIA','DESTILADOS') NOT NULL,
	`difficulty` enum('RAJADO','CLASSICO','MESTRE') NOT NULL,
	`description` text NOT NULL,
	`rajado` json,
	`classico` json,
	`mestre` json,
	`macete` text,
	`xp` int NOT NULL DEFAULT 50,
	`views` int NOT NULL DEFAULT 0,
	`likes` int NOT NULL DEFAULT 0,
	`warnings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `recipes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userRecipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int NOT NULL,
	`status` enum('STARTED','IN_PROGRESS','COMPLETED','FAILED') NOT NULL DEFAULT 'STARTED',
	`photo` varchar(512),
	`notes` text,
	`rating` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `userRecipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `xp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `rank` enum('NOVATO','BRO_DA_PANELA','MESTRE_DO_MALTE','ALQUIMISTA','LEGEND') DEFAULT 'NOVATO' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tier` enum('FREE','MESTRE','CLUBE_BRO') DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `streak` int DEFAULT 0 NOT NULL;