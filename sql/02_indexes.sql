USE `nyc_taxi`;

ALTER TABLE `Trips` ADD INDEX `idx_trips_piu_timedate` (`piu_timedate`);
ALTER TABLE `Trips` ADD INDEX `idx_trips_piu_hour` (`piu_hour`);

ALTER TABLE `Trips` ADD INDEX `idx_trips_piu_geo` (`piu_latitude`, `piu_longitude`);
 
ALTER TABLE `Trips` ADD INDEX `idx_trips_vnd_id` (`vnd_id`);
ALTER TABLE `Trips` ADD INDEX `idx_trips_rate_cd_id` (`rate_cd_id`);
ALTER TABLE `Trips` ADD INDEX `idx_trips_pyt_type_id` (`pyt_type_id`);

