-- Kết nối vào database mặc định
\c postgres

-- Xóa nếu tồn tại
DROP DATABASE IF EXISTS entertainment;

-- Tạo lại database
CREATE DATABASE entertainment
  WITH ENCODING = 'UTF8'
       LC_COLLATE = 'English_United States.1252'
       LC_CTYPE = 'English_United States.1252'
       TEMPLATE = template0;

-- Kết nối vào database vừa tạo
\c entertainment

-- Kích hoạt PostGIS
CREATE EXTENSION postgis;
