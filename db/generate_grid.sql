INSERT INTO city_1km_grid (grid_id, grid_x, grid_y, grid_polygon)
SELECT
    'grid_' || i || '_' || j AS grid_id,
    i AS grid_x,
    j AS grid_y,
    ST_Transform(geom, 3857) AS grid_polygon
FROM ST_SquareGrid(
    1000,
    ST_Transform(
        ST_MakeEnvelope(76.8384, 28.4041, 77.3464, 28.8836, 4326),
        32643
    )
) AS grid(geom, i, j);