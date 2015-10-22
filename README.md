# Wikipedia Pageview Counter

This repo contains code to take [hourly page view count data](https://dumps.wikimedia.org/other/pagecounts-raw/)
from Wikipedia, and construct page counts for longer periods using PostgreSQL.

**Note: This requires PostgreSQL 9.5 to take advantage of the new
[UPSERT](https://wiki.postgresql.org/wiki/UPSERT) feature, or it's just too slow**


## How it works

Hourly page view files are downloaded on demand (or you can download them yourself and read directly
from the files), a Node script parses the files and imports relevant data into Postgres, and finally
fun queries can be run against the resulting data.

## Requirements

So far this has been used only to aggregate a single month of Wikipedia logs.

* 64GB of disk space and/or an internet connection fast enough to download 64GB, to store one months
  worth of logs
* Another 35GB or so of disk space to be used by Postgres
* About a day of processing on a modern quad core CPU

## Instructions

1. Set up a PostgreSQL 9.5 beta1 or newer instance (with PostGIS)
2. Download the Wikipedia world PostGIS dump from
[here](https://de.wikipedia.org/wiki/Wikipedia:WikiProjekt_Georeferenzierung/Hauptseite/Wikipedia-World/en)
3. Gernerate a list of pagecount files to download (currently manual, a sample for Sept 2015 is
included)
4. Read and modify crunch.sh to suit your needs, run it, and wait
5. View the output of top viewed pages with location data that is calculated automatically
6. Run other interesting queries and report back!
