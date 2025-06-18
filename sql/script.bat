@echo off

chcp 65001;

echo Đang import GeoJSON vào PostgreSQL...

ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=entertainment user=postgres password=1" "C:\xampp\htdocs\webgis_project\data\leisure_with_location.geojson" -nln leisure -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom -lco FID=id -lco PRECISION=NO -overwrite

echo Hoàn tất import.
pause
