CREATE TABLE `admin` (
	`username` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`company_api_key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `location` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`location_name` text NOT NULL,
	`location_country` text NOT NULL,
	`location_city` text NOT NULL,
	`location_meta` text,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sensor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`location_id` integer NOT NULL,
	`sensor_name` text NOT NULL,
	`sensor_category` text NOT NULL,
	`sensor_api_key` text NOT NULL,
	`sensor_meta` text,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sensordata` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sensor_id` integer NOT NULL,
	`data` text NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`sensor_id`) REFERENCES `sensor`(`id`) ON UPDATE no action ON DELETE no action
);
