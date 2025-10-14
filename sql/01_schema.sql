CREATE DATABASE IF NOT EXISTS `nyc_taxi`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE `nyc_taxi`;

CREATE TABLE IF NOT EXISTS `Vendors` (
  `vnd_id`        VARCHAR(16)  NOT NULL,
  `vendor_name`   VARCHAR(100) NOT NULL,
  PRIMARY KEY (`vnd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rate_cds` (
  `rate_cd_id`    VARCHAR(16)  NOT NULL,
  `description`   VARCHAR(100) NOT NULL,
  PRIMARY KEY (`rate_cd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payment_types` (
  `pyt_type_id`   VARCHAR(16)  NOT NULL,
  `description`   VARCHAR(100) NOT NULL,
  PRIMARY KEY (`pyt_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Trips` (
  `trip_no`                 VARCHAR(32)  NOT NULL,

  `piu_timedate`            DATETIME     NOT NULL,  `arrival_timedate`        DATETIME     NOT NULL,

  `passenger_count`         INT UNSIGNED NOT NULL,

  `piu_latitude`            DECIMAL(9,6) NOT NULL,  `piu_longitude`           DECIMAL(9,6) NOT NULL,
  `arv_latitude`            DECIMAL(9,6) NOT NULL,  `arv_longitude`           DECIMAL(9,6) NOT NULL,

  `trip_period_sec`         INT UNSIGNED NOT NULL,  `trip_period_min`         DECIMAL(10,3) NULL,
  `trip_dist_km`            DECIMAL(10,3) NOT NULL,  `trip_speed_kmh`          DECIMAL(10,3) NULL,
  `distance_per_passenger`  DECIMAL(10,3) NULL,

  `piu_hour`                TINYINT NULL, `piu_day`                 VARCHAR(16) NULL,
  `piu_month`               VARCHAR(16) NULL, `vnd_id`                  VARCHAR(16) NULL, `rate_cd_id`              VARCHAR(16) NULL,
  `pyt_type_id`             VARCHAR(16) NULL, PRIMARY KEY (`trip_no`),

  CONSTRAINT `fk_trips_vendor`
    FOREIGN KEY (`vnd_id`) REFERENCES `Vendors`(`vnd_id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,

  CONSTRAINT `fk_trips_rate`
    FOREIGN KEY (`rate_cd_id`) REFERENCES `rate_cds`(`rate_cd_id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,

  CONSTRAINT `fk_trips_payment_type`
    FOREIGN KEY (`pyt_type_id`) REFERENCES `payment_types`(`pyt_type_id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,

  CONSTRAINT `chk_piu_latitude_range` CHECK (`piu_latitude`  BETWEEN -90  AND 90),  CONSTRAINT `chk_arv_latitude_range` CHECK (`arv_latitude`  BETWEEN -90  AND 90),
  CONSTRAINT `chk_piu_longitude_range` CHECK (`piu_longitude` BETWEEN -180 AND 180),  CONSTRAINT `chk_arv_longitude_range` CHECK (`arv_longitude` BETWEEN -180 AND 180),
  CONSTRAINT `chk_trip_period_positive` CHECK (`trip_period_sec` > 0),  CONSTRAINT `chk_trip_dist_nonneg` CHECK (`trip_dist_km` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

