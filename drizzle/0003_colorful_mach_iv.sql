CREATE TABLE `conversationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`messages` json NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`xpGained` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversationHistory_id` PRIMARY KEY(`id`)
);
