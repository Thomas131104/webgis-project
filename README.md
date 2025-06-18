# WebGIS - Bản đồ các khu vực giải trí tại Việt Nam

Dự án WebGIS này xây dựng một hệ thống bản đồ tương tác hiển thị các địa điểm giải trí (leisure) trên toàn lãnh thổ Việt Nam, được thu thập từ OpenStreetMap và xử lý hiển thị bằng Leaflet.js.

## 🗺️ Tính năng chính

- Hiển thị các điểm giải trí với icon minh họa trực quan (công viên, gym, thể thao, resort, v.v.).
- Hỗ trợ tìm kiếm địa điểm gần vị trí người dùng theo bán kính và thể loại.
- Popup hiển thị tên địa điểm, khoảng cách.
- Kết nối dữ liệu động từ cơ sở dữ liệu PostgreSQL + PostGIS.
- Giao diện responsive, hoạt động trên desktop và mobile.

---

## ⚙️ Công nghệ sử dụng

| Thành phần     | Công nghệ                          |
|----------------|------------------------------------|
| Frontend       | HTML, CSS, JavaScript, Leaflet.js, Bootstrap 5 |
| Backend        | PHP                                |
| Cơ sở dữ liệu  | PostgreSQL + PostGIS               |
| Xử lý dữ liệu  | Python (GeoPandas)                 |
| Import dữ liệu | `ogr2ogr` từ OSGeo4W               |

---

## 📁 Cấu trúc thư mục

```
webgis_project/
├── api/ # Backend PHP API
├── data/ # GeoJSON, cấu hình, dữ liệu GADM
├── docs/ # Tài liệu, hướng dẫn
├── public/ # Giao diện và bản đồ frontend
├── sql/ # Script tạo và import database
├── template/ # Thư viện frontend (Bootstrap, Leaflet)
└── .vscode/ # Cấu hình VS Code (nếu có)
```


---

## 📌 Các bước triển khai

### B1: Thu thập dữ liệu

1. **GADM Việt Nam** (ranh giới hành chính): https://gadm.org/download_country.html
2. **OpenStreetMap - Leisure**:
   - Truy vấn toàn Việt Nam với đoạn mã Overpass Turbo:
     ```osm
     area(3600049915)->.searchArea;
     (
       node["leisure"](area.searchArea);
       way["leisure"](area.searchArea);
       relation["leisure"](area.searchArea);
     );
     out center tags;
     >;
     out skel qt;
     ```

### B2: Tiền xử lý dữ liệu (Colab)

- Lọc và gom nhóm các loại leisure thành các nhóm chính (`sports`, `gym`, `park`, `resort`,...).
- Gán nhãn tiếng Việt.
- Cắt theo ranh giới Việt Nam và gán tên hành chính.
- Xuất ra `leisure_with_location.geojson`.

📄 Colab: [Xử lý dữ liệu](https://colab.research.google.com/drive/1u7SNyXcMERbwIqULQYlqE1pvdGqUbEis)

### B3: Tạo cơ sở dữ liệu

1. Tạo CSDL và bật PostGIS:
   ```sql
   CREATE DATABASE entertainment;
   \c entertainment
   CREATE EXTENSION postgis;
    ```

2. Import dữ liệu bằng ogr2ogr (sử dụng script.bat, yêu cầu phải có Osgeo từ QGIS):

```bash
ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=entertainment user=postgres password=1" ^
    "data/leisure_with_location.geojson" -nln leisure -nlt PROMOTE_TO_MULTI ^
    -lco GEOMETRY_NAME=geom -lco FID=id -lco PRECISION=NO -overwrite
```

### B4: Cài đặt frontend

- index.html: bản đồ chính

- showingMap.js: hiển thị bản đồ và marker

- extractingToJson.js: đọc dữ liệu từ backend/API

- normalization.json: ánh xạ icon tương ứng cho từng loại leisure

### B5: Kết nối backend (PHP)
api/query.php: truy vấn dữ liệu từ bảng leisure theo loại hình, vị trí, bán kính và số lượng.

Sử dụng pg_connect, pg_query_params, trả JSON cho frontend.

## Cách sử dụng

1. Mở public/index.html trong trình duyệt (qua localhost nếu dùng XAMPP).

2. Chọn:
- Thể loại (ví dụ: Công viên, Gym, Thể thao,...)
- Bán kính tìm kiếm
- Số lượng kết quả cần truy vấn
- Nhấn Truy xuất để lấy dữ liệu.

3. Kết quả sẽ:
- Hiển thị danh sách địa điểm (bên trái)
- Hiển thị marker tương ứng trên bản đồ (bên phải)

## Mô tả giao diện

|Giao diện|Mô tả|
|-------------------|-----------------|
|![](screenshot/B0.png)|Trước khi truy vấn|
|![](screenshot/B1.png)|Sau khi truy vấn: kết quả hiển thị ở cột trái và bản đồ bên phải|

## 📦 Tính năng nổi bật

- Tìm kiếm địa điểm gần bạn với bán kính tùy chọn
- Biểu tượng trực quan cho từng loại hình giải trí
- Truy xuất nhanh và hiển thị ngay trên bản đồ
- Có thể mở rộng dễ dàng để thêm phân loại, bộ lọc nâng cao, hoặc tìm kiếm theo từ khóa

## 📚 Tham khảo

- GADM - Global Administrative Areas
- Overpass Turbo
- Leaflet.js
- PostGIS
- GeoPandas