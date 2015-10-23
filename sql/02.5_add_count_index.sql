-- Index: view_counts_count

-- DROP INDEX view_counts_count;

CREATE INDEX view_counts_count
  ON view_counts
  USING btree
  (count DESC);

ANALYZE view_counts;
