#!/bin/bash -ex

# drop it all!
psql -d wikipedia < sql/00_reset.sql

# create view counts table
psql -d wikipedia < sql/02_create_view_counts_table.sql

# import lat/lon wikidump
psql -d wikipedia < ~/data/WikipediaGeo.pgbackup

# modify wikidump with new row and index
psql -d wikipedia < sql/01_modify_wiki_geo_table.sql

# in parallel import view counts data
# a.) from web (easier on disk, slower)
# cat pagecounts.txt | xargs -P 8 -n 1 node index.js
# b.) from files ( faster for multiple runs)
# wget -I pagecounts.txt # use this to download
find /home/julian/data/wikipedia/*.gz | xargs -P 8 -n 1 node index.js

# run SQL query
# a.) with result for each lat/lon
psql -d wikipedia -q -t -A -F","< sql/03-query-with-dupes-for-each-lat-lon.sql > ~/full-out.csv
# b.) with deduped results
psql -d wikipedia -q -t -A -F","< sql/04-query-deduped.sql > ~/full-out-deduped.csv
