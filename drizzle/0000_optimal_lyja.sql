CREATE TABLE `hospitals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hospital_id` text NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`capacity_total` integer NOT NULL,
	`capacity_current` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hospitals_hospital_id_unique` ON `hospitals` (`hospital_id`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`risk_level` text NOT NULL,
	`predicted_additional_patients_6h` integer NOT NULL,
	`recommended_actions` text NOT NULL,
	`alert_message` text NOT NULL,
	`confidence_score` real,
	`created_at` text NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `snapshots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hospital_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`beds_total` integer NOT NULL,
	`beds_free` integer NOT NULL,
	`doctors_on_shift` integer NOT NULL,
	`nurses_on_shift` integer NOT NULL,
	`oxygen_cylinders` integer NOT NULL,
	`ventilators` integer NOT NULL,
	`medicines` text NOT NULL,
	`incoming_emergencies` integer NOT NULL,
	`incident_description` text,
	`aqi` integer,
	`festival` text,
	`news_summary` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`hospital_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);