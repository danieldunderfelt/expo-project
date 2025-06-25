CREATE TABLE `order_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`change_key` text NOT NULL,
	`change_value` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`order_id` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `change_key_idx` ON `order_changes` (`change_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_order_change` ON `order_changes` (`order_id`,`change_key`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	`department` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `orders` (`name`);--> statement-breakpoint
CREATE INDEX `department_idx` ON `orders` (`department`);
