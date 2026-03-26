CREATE TABLE `app_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appRole` enum('homeowner','tradesperson') NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`phone` varchar(20),
	`postcode` varchar(10) NOT NULL,
	`profilePhotoUrl` text,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`identityVerified` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`subscriptionTier` enum('free','pro','business') NOT NULL DEFAULT 'free',
	`loyaltyTier` enum('bronze','silver','gold') NOT NULL DEFAULT 'bronze',
	`totalJobsCompleted` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0',
	`reviewCount` int NOT NULL DEFAULT 0,
	`referralCode` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`homeownerId` int NOT NULL,
	`tradespersonId` int NOT NULL,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`homeownerUnread` int NOT NULL DEFAULT 0,
	`tradespersonUnread` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tradespersonId` int NOT NULL,
	`credentialType` varchar(100) NOT NULL,
	`issuer` varchar(255),
	`documentUrl` text,
	`registrationNumber` varchar(100),
	`issuedAt` timestamp,
	`expiresAt` timestamp,
	`verificationStatus` enum('pending','verified','rejected','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favourites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`homeownerId` int NOT NULL,
	`tradespersonId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favourites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homeowner_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyType` enum('house','flat','bungalow','commercial','other') NOT NULL DEFAULT 'house',
	`maintenancePlanActive` boolean NOT NULL DEFAULT false,
	`loyaltyCreditsGbp` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homeowner_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`caption` varchar(255),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`homeownerId` int NOT NULL,
	`tradeCategoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`postcode` varchar(10) NOT NULL,
	`status` enum('draft','open','quoting','accepted','in_progress','completed','cancelled','disputed') NOT NULL DEFAULT 'open',
	`urgency` enum('normal','urgent','emergency') NOT NULL DEFAULT 'normal',
	`budgetMin` decimal(10,2),
	`budgetMax` decimal(10,2),
	`budgetNotSure` boolean NOT NULL DEFAULT false,
	`preferredStartDate` timestamp,
	`isGroupJob` boolean NOT NULL DEFAULT false,
	`isEmergency` boolean NOT NULL DEFAULT false,
	`quoteCount` int NOT NULL DEFAULT 0,
	`acceptedQuoteId` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`body` text,
	`photoUrl` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('new_job','new_quote','quote_accepted','quote_rejected','new_message','job_completed','review_received','payment_released','credential_expiring','emergency_job','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`linkJobId` int,
	`linkQuoteId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`tradespersonId` int NOT NULL,
	`title` varchar(255),
	`description` text,
	`photoUrl` text,
	`isMilestone` boolean NOT NULL DEFAULT false,
	`milestoneTitle` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`tradespersonId` int NOT NULL,
	`priceGbp` decimal(10,2) NOT NULL,
	`timelineDays` int,
	`timelineText` varchar(100),
	`message` text,
	`videoUrl` text,
	`isBoosted` boolean NOT NULL DEFAULT false,
	`boostPriceGbp` decimal(5,2),
	`status` enum('pending','accepted','rejected','withdrawn','expired') NOT NULL DEFAULT 'pending',
	`isBestMatch` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`revieweeId` int NOT NULL,
	`reviewerRole` enum('homeowner','tradesperson') NOT NULL,
	`overallRating` decimal(3,2) NOT NULL,
	`qualityRating` decimal(3,2),
	`punctualityRating` decimal(3,2),
	`communicationRating` decimal(3,2),
	`valueRating` decimal(3,2),
	`comment` text,
	`tradespersonResponse` text,
	`isVisible` boolean NOT NULL DEFAULT false,
	`visibleAt` timestamp,
	`isFlagged` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trade_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icon` varchar(50),
	`isGreenCategory` boolean NOT NULL DEFAULT false,
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `trade_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `trade_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tradesperson_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255),
	`bio` text,
	`yearsExperience` int,
	`serviceRadiusMiles` int NOT NULL DEFAULT 10,
	`emergencyAvailable` boolean NOT NULL DEFAULT false,
	`ecoCertified` boolean NOT NULL DEFAULT false,
	`videoIntroUrl` text,
	`responseRatePercent` decimal(5,2) NOT NULL DEFAULT '0',
	`reputationScore` decimal(5,2),
	`strikes` int NOT NULL DEFAULT 0,
	`isSuspended` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradesperson_profiles_id` PRIMARY KEY(`id`)
);
