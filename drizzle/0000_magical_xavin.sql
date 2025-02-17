CREATE TABLE `commentary_table` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL,
	`commentary` text NOT NULL,
	`embedding` vector(1536, F32),
	`latency` float NOT NULL,
	`warriors_win_probability` float NOT NULL,
	`warriors_score` float NOT NULL,
	`cavaliers_score` float NOT NULL,
	`game_clock` varchar(10) NOT NULL,
	CONSTRAINT `commentary_table_id` PRIMARY KEY(`id`)
);
