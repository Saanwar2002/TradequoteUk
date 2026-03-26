ALTER TABLE `jobs` ADD `aiEstimatedMin` decimal(10,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `aiEstimatedMax` decimal(10,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `aiEstimationReasoning` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `jobs` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `progress_updates` ADD `milestoneStatus` enum('pending','completed','verified') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `progress_updates` ADD `verifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tradesperson_profiles` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `tradesperson_profiles` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `availability_slots` DROP COLUMN `isBooked`;