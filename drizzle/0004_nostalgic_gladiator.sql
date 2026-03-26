CREATE TABLE `job_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tradespersonId` int NOT NULL,
	`tradeCategory` varchar(100) NOT NULL,
	`postcode` varchar(10) NOT NULL,
	`radiusMiles` int NOT NULL DEFAULT 10,
	`minBudget` int,
	`maxBudget` int,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_alerts_id` PRIMARY KEY(`id`)
);
