-- Table: view_counts

-- DROP TABLE view_counts;

CREATE TABLE view_counts
(
  path text,
  language character(15),
  count integer,
  UNIQUE (path, language)
);
