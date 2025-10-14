# Db Design Notes

This document describes the relational schema used to store and query NYC taxi trips for the Urban Mobility Data Explorer. It aligns with the ERD in `docs/erd.png` and the cleaned dataset produced by our pipeline.

### Scope and Goals

- Ensure integrity and consistency for trip records and categorical references.
- Support common query patterns for:
  - Time-window filtering and aggregations (hourly, daily).
  - Basic geographic filtering around pickup locations.
- Keep the model simple and normalized so the backend can join on small lookup tables.

---

### Tables and Roles

## Trips
- Purpose: One row represents a single taxi trip (temporal, geographic, and derived metrics).
- Primary Key:
  - `[PK] trip_no`
- Foreign Keys:
  - `[FK] vnd_id` → `Vendors(vnd_id)`
  - `[FK] rate_cd_id` → `rate_cds(rate_cd_id)`
  - `[FK] pyt_type_id` → `payment_types(pyt_type_id)`
- Required columns (+):
  - `+piu_timedate`, `+arrival_timedate`, `+passenger_count`
  - `+piu_latitude`, `+piu_longitude`, `+arv_latitude`, `+arv_longitude`
  - `+trip_period_sec`, `+trip_dist_km`
- Optional/derived columns:
  - `trip_period_min`, `trip_speed_kmh`, `distance_per_passenger`
  - `piu_hour`, `piu_day`, `piu_month`

Notes
- Derived fields are precomputed during cleaning to simplify downstream analytics.
- `piu_*` fields refer to pickup; `arv_*` fields refer to dropoff.

## Vendors
- Purpose: Lookup of vendor codes.
- Columns:
  - `[PK] vnd_id`
  - `+vendor_name`

## rate_cds
- Purpose: Lookup of rate categories.
- Columns:
  - `[PK] rate_cd_id`
  - `+description`

## payment_types
- Purpose: Lookup of payment method categories.
- Columns:
  - `[PK] pyt_type_id`
  - `+description`

---

### Relationships and Cardinality

- `Trips(vnd_id)` → `Vendors(vnd_id)`: Many trips per vendor (N:1).
- `Trips(rate_cd_id)` → `rate_cds(rate_cd_id)`: Many trips per rate code (N:1).
- `Trips(pyt_type_id)` → `payment_types(pyt_type_id)`: Many trips per payment type (N:1).

Benefits
- Normalization prevents category drift and enforces integrity with foreign keys.
- Small lookup tables improve readability and keep trip rows lean.

---

### Constraints and Data Integrity

Non-null (aligns with `+` in the ERD):
- `piu_timedate`, `arrival_timedate`, `passenger_count`
- `piu_latitude`, `piu_longitude`, `arv_latitude`, `arv_longitude`
- `trip_period_sec`, `trip_dist_km`

Domain checks (enforced where supported):
- Geographic ranges:
  - `piu_latitude`, `arv_latitude` ∈ [−90, 90]
  - `piu_longitude`, `arv_longitude` ∈ [−180, 180]
- Physical plausibility:
  - `trip_period_sec` > 0
  - `trip_dist_km` ≥ 0

Referential integrity:
- Every `vnd_id` must exist in `Vendors`.
- Every `rate_cd_id` must exist in `rate_cds`.
- Every `pyt_type_id` must exist in `payment_types`.

---

### Indexing Strategy (Performance)

Time access
- Index on `piu_timedate` to accelerate range queries (hour/day/week).
- Optional index on `piu_hour` to speed hourly aggregations.

Geolocation
- Composite index on (`piu_latitude`, `piu_longitude`) for pickup-area filters.

Rationale
- Matches the backend endpoints that filter trips by time and provide location summaries.
- Balanced to avoid over-indexing while covering core access paths.

---

### Normalization Choices and Trade-offs

- Lookups (`Vendors`, `rate_cds`, `payment_types`) are normalized to guarantee consistency of categorical values and enable FK checks.
- Derived metrics remain in `Trips` to avoid recomputing distance/speed in the API for every request.
- Payments table deliberately omitted in this release because the dataset in scope does not include monetary fields. If those fields are added later, introduce a 1:1 `Payments` table keyed by `trip_no`.

---

### Data Load and Validation

Source
- Cleaned CSV: `data/cleaned_taxi_data.csv`, produced by the processing script (missing/outliers handled and derived fields computed).

Post-load checks (documented in [docs/validation_counts.txt](nyc_taxi_cleaning/docs/validation_counts.txt:0:0-0:0))
- Row count: expected around 1,447,796 trips.
- Date window: min/max of `piu_timedate` covering the loaded period.
- Index presence: verify with `SHOW INDEX FROM Trips;`
- Spot checks: sample rows and basic sanity on ranges.

---

### Backend Integration Notes

- Common filters and aggregations:
  - Time windows using `piu_timedate` and optionally `piu_hour`.
  - Basic pickup area boxes using `piu_latitude`, `piu_longitude`.
- The index plan above directly serves `/trips` filtering and `/insights` summaries in the backend.