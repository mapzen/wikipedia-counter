 -- some wikipedia articles have multiple lat/lons. This will return one row for each lat/lon, meaning each page may have many rows
SELECT
DISTINCT on (view_counts.path)
  view_counts.path, wp_coords_red0.lat as lat, wp_coords_red0.lon as lon, view_counts.count as count
FROM
  public.wp_coords_red0, public.view_counts
WHERE
  wp_coords_red0.lang = 'en' AND
  view_counts.path = wp_coords_red0.path
ORDER BY view_counts.path, view_counts.count desc)

