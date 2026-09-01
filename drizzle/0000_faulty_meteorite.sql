CREATE TABLE `audit_logs` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`action` enum('donor_verified','donor_unverified','donor_imported','request_fulfilled','request_canceled','request_reopened','request_escalated','user_role_changed','user_added','user_deleted','org_settings_updated','event_created','event_updated','event_deleted','donation_recorded') NOT NULL,
	`performed_by_id` int unsigned,
	`organization_id` int unsigned NOT NULL,
	`target_type` varchar(64),
	`target_id` int unsigned,
	`details` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blood_request_matches` (
	`request_id` int unsigned NOT NULL,
	`donor_profile_id` int unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blood_request_matches_request_id_donor_profile_id_pk` PRIMARY KEY(`request_id`,`donor_profile_id`)
);
--> statement-breakpoint
CREATE TABLE `blood_requests` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`patient_name` varchar(191) NOT NULL,
	`blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
	`location` varchar(512),
	`district` varchar(128),
	`upazila` varchar(128),
	`urgency` enum('normal','urgent','emergency') NOT NULL DEFAULT 'normal',
	`required_date` datetime,
	`contact_number` varchar(32) NOT NULL,
	`additional_notes` text,
	`status` enum('pending','fulfilled','canceled') NOT NULL DEFAULT 'pending',
	`requester_id` int unsigned,
	`organization_id` int unsigned NOT NULL,
	`escalated_at` timestamp,
	`fulfilled_by_id` int unsigned,
	`feedback_rating` tinyint unsigned,
	`feedback_notes` text,
	`feedback_submitted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blood_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`donor_profile_id` int unsigned NOT NULL,
	`organization_id` int unsigned NOT NULL,
	`blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
	`donation_date` datetime NOT NULL,
	`location` varchar(512),
	`recipient_name` varchar(191),
	`notes` text,
	`points_awarded` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donor_profiles` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned NOT NULL,
	`organization_id` int unsigned NOT NULL,
	`blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
	`district` varchar(128),
	`upazila` varchar(128),
	`village` varchar(128),
	`last_donation_date` datetime,
	`total_donations` int unsigned NOT NULL DEFAULT 0,
	`points` int unsigned NOT NULL DEFAULT 0,
	`badges` json,
	`is_available` boolean NOT NULL DEFAULT true,
	`is_verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `donor_profiles_user_org_unique` UNIQUE(`user_id`,`organization_id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` text,
	`date` datetime NOT NULL,
	`end_date` datetime,
	`location` varchar(512),
	`district` varchar(128),
	`upazila` varchar(128),
	`organization_id` int unsigned NOT NULL,
	`created_by_id` int unsigned,
	`max_participants` int unsigned,
	`contact_number` varchar(32),
	`status` enum('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`email` varchar(191),
	`category` enum('general','bug','feature','support') NOT NULL DEFAULT 'general',
	`message` text NOT NULL,
	`status` enum('new','in_progress','resolved','dismissed') NOT NULL DEFAULT 'new',
	`organization_id` int unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`logo` varchar(512),
	`primary_color` varchar(32) NOT NULL DEFAULT '#D32F2F',
	`contact_email` varchar(191),
	`contact_phone` varchar(32),
	`address` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`organization_id` int unsigned NOT NULL,
	`user_id` int unsigned,
	`district` varchar(128),
	`blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_subscriptions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`phone` varchar(32),
	`email` varchar(191),
	`password` varchar(255),
	`image` varchar(512),
	`role` enum('donor','patient','volunteer','admin','super_admin') NOT NULL DEFAULT 'patient',
	`organization_id` int unsigned,
	`onboarding_completed` boolean NOT NULL DEFAULT false,
	`notification_preferences` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_performed_by_id_users_id_fk` FOREIGN KEY (`performed_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blood_request_matches` ADD CONSTRAINT `blood_request_matches_request_id_blood_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `blood_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blood_request_matches` ADD CONSTRAINT `blood_request_matches_donor_profile_id_donor_profiles_id_fk` FOREIGN KEY (`donor_profile_id`) REFERENCES `donor_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_requester_id_users_id_fk` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_fulfilled_by_id_donor_profiles_id_fk` FOREIGN KEY (`fulfilled_by_id`) REFERENCES `donor_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_donor_profile_id_donor_profiles_id_fk` FOREIGN KEY (`donor_profile_id`) REFERENCES `donor_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donor_profiles` ADD CONSTRAINT `donor_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donor_profiles` ADD CONSTRAINT `donor_profiles_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_org_created_idx` ON `audit_logs` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `blood_request_matches_donor_idx` ON `blood_request_matches` (`donor_profile_id`);--> statement-breakpoint
CREATE INDEX `blood_requests_org_status_idx` ON `blood_requests` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `blood_requests_org_created_idx` ON `blood_requests` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `blood_requests_urgency_idx` ON `blood_requests` (`urgency`);--> statement-breakpoint
CREATE INDEX `donations_donor_idx` ON `donations` (`donor_profile_id`);--> statement-breakpoint
CREATE INDEX `donations_org_date_idx` ON `donations` (`organization_id`,`donation_date`);--> statement-breakpoint
CREATE INDEX `donor_profiles_match_idx` ON `donor_profiles` (`organization_id`,`blood_group`,`is_available`);--> statement-breakpoint
CREATE INDEX `donor_profiles_org_created_idx` ON `donor_profiles` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `donor_profiles_district_idx` ON `donor_profiles` (`district`);--> statement-breakpoint
CREATE INDEX `events_org_status_idx` ON `events` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `events_org_date_idx` ON `events` (`organization_id`,`date`);--> statement-breakpoint
CREATE INDEX `feedback_org_status_idx` ON `feedback` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `feedback_category_idx` ON `feedback` (`category`);--> statement-breakpoint
CREATE INDEX `organizations_is_active_idx` ON `organizations` (`is_active`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_org_idx` ON `push_subscriptions` (`organization_id`);--> statement-breakpoint
CREATE INDEX `users_organization_id_idx` ON `users` (`organization_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);