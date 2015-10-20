-- Table: view_counts

-- DROP TABLE view_counts;

CREATE TABLE view_counts
(
  id serial NOT NULL,
  path text,
  language character(10),
  count bigint,
  CONSTRAINT view_counts_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

-- Index: view_counts_count

-- DROP INDEX view_counts_count;

CREATE INDEX view_counts_count
  ON view_counts
  USING btree
  (count DESC);

-- Index: view_counts_id

-- DROP INDEX view_counts_id;

CREATE INDEX view_counts_id
  ON view_counts
  USING btree
  (id);

-- Index: view_counts_path_hash

-- DROP INDEX view_counts_path_hash;

CREATE INDEX view_counts_path_hash
  ON view_counts
  USING hash
  (path COLLATE pg_catalog."default");

-- Index: view_counts_path_sorted

-- DROP INDEX view_counts_path_sorted;

CREATE INDEX view_counts_path_sorted
  ON view_counts
  USING btree
  (path COLLATE pg_catalog."default" DESC);

