USE `nyc_taxi`;

SET UNIQUE_CHECKS=0;
SET FOREIGN_KEY_CHECKS=0;

LOAD DATA LOCAL INFILE 'data/sample_of_cleaned_data.csv'
INTO TABLE `trips`
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@id,
 @vendor_id,
 @pickup_datetime,
 @dropoff_datetime,
 @passenger_count,
 @pickup_longitude,
 @pickup_latitude,
 @dropoff_longitude,
 @dropoff_latitude,
 @store_and_fwd_flag,
 @trip_duration,
 @trip_duration_min,
 @trip_distance_km,
 @trip_speed_kmh,
 @distance_per_passenger,
 @pickup_hour,
 @pickup_day,
 @pickup_month)

SET
  `trip_no`                = @id,
  `vnd_id`                 = NULLIF(@vendor_id,''),
  `piu_timedate`           = STR_TO_DATE(@pickup_datetime, '%Y-%m-%d %H:%i:%s'),
  `arrival_timedate`       = STR_TO_DATE(@dropoff_datetime, '%Y-%m-%d %H:%i:%s'),
  `passenger_count`        = NULLIF(@passenger_count,''),
  `piu_longitude`          = NULLIF(@pickup_longitude,''),
  `piu_latitude`           = NULLIF(@pickup_latitude,''),
  `arv_longitude`          = NULLIF(@dropoff_longitude,''),
  `arv_latitude`           = NULLIF(@dropoff_latitude,''),
  `trip_period_sec`        = NULLIF(@trip_duration,''),
  `trip_period_min`        = NULLIF(@trip_duration_min,''),
  `trip_dist_km`           = NULLIF(@trip_distance_km,''),
  `trip_speed_kmh`         = NULLIF(@trip_speed_kmh,''),
  `distance_per_passenger` = NULLIF(@distance_per_passenger,''),
  `piu_hour`               = NULLIF(@pickup_hour,''),
  `piu_day`                = NULLIF(@pickup_day,''),
  `piu_month`              = NULLIF(@pickup_month,'');
LIMIT 100;

SET UNIQUE_CHECKS=1;
SET FOREIGN_KEY_CHECKS=1;


ANALYZE TABLE `Trips`;
SELECT COUNT(*) AS trips_loaded FROM `trips`;
SELECT MIN(`piu_timedate`) AS min_pickup, MAX(`piu_timedate`) AS max_pickup FROM `trips`;
SHOW INDEX FROM `trips`;

