ALTER TABLE `jobs` ADD `expiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `jobs` ADD `isBoosted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tradesperson_profiles` ADD `averageResponseTimeMinutes` int DEFAULT 0 NOT NULL;