USE `nyc_taxi`;

INSERT IGNORE INTO `Vendors` (`vnd_id`, `vendor_name`) VALUES
  ('1', 'Vendor 1'),
  ('2', 'Vendor 2'),
  ('CMT', 'Creative Mobile Technologies'),
  ('VTS', 'VeriFone Transportation Systems');

INSERT IGNORE INTO `rate_cds` (`rate_cd_id`, `description`) VALUES
  ('1', 'Standard rate'),
  ('2', 'JFK'),
  ('3', 'Newark'),
  ('4', 'Nassau/Westchester'),
  ('5', 'Negotiated fare'),
  ('6', 'Group ride');

INSERT IGNORE INTO `payment_types` (`pyt_type_id`, `description`) VALUES
  ('1', 'Credit card'),
  ('2', 'Cash'),
  ('3', 'No charge'),
  ('4', 'Dispute'),
  ('5', 'Unknown'),
  ('6', 'mobile money');

