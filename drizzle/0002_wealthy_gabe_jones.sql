CREATE TABLE `phone_verifications` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`phone` varchar(32) NOT NULL,
	`code_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`attempts` int unsigned NOT NULL DEFAULT 0,
	`consumed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phone_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `organizations` ADD `district` varchar(128);--> statement-breakpoint
ALTER TABLE `organizations` ADD `upazila` varchar(128);--> statement-breakpoint
CREATE INDEX `phone_verifications_phone_idx` ON `phone_verifications` (`phone`);--> statement-breakpoint
CREATE INDEX `phone_verifications_expires_idx` ON `phone_verifications` (`expires_at`);