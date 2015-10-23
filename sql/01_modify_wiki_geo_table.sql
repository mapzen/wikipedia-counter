ALTER TABLE wp_coords_red0 ADD COLUMN path text;

UPDATE
  wp_coords_red0
SET
  path = replace(wp_coords_red0."Titel", ' ', '_');

-- create hash index for fast comparison to view counts table
CREATE INDEX wp_coords_path_hash
  ON wp_coords_red0
  USING hash
  (path COLLATE pg_catalog."default");

ANALYZE wp_coords_red0;
