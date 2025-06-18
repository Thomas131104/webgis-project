<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

// Lấy dữ liệu JSON từ client
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$lat = $data["location"]["lat"];
$lng = $data["location"]["lng"];
$radius = $data["radius"];
$type = $data["type"];
$quantile = $data["quantile"];

// Kết nối CSDL
$config = parse_ini_file("../data/admin.ini", true);
$server = $config["SERVER"];
$host = $server["host"];
$user = $server["user"];
$password = $server["password"];
$database = "entertainment";

$conn = pg_connect("host=$host dbname=$database user=$user password=$password");
if (!$conn) {
    echo json_encode(["error" => "Không kết nối được đến PostgreSQL"]);
    exit;
}

// Đảm bảo encoding
pg_query($conn, "SET client_encoding = 'UTF8'");

// Truy vấn địa điểm trong bán kính
$sql = "
    SELECT 
        id, 
        COALESCE(name, 'Không có tên') AS name,
        ST_X(ST_GeometryN(geom, 1)) AS lng,
        ST_Y(ST_GeometryN(geom, 1)) AS lat,
        ST_Distance(
            ST_GeometryN(geom, 1)::geography,
            ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
        ) AS distance
    FROM leisure
    WHERE LOWER(leisure_grouped) = LOWER($1)
    AND ST_DWithin(
        ST_GeometryN(geom, 1)::geography,
        ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
        $4
    )
    ORDER BY distance ASC
    LIMIT $5;
";



$result = pg_query_params($conn, $sql, [$type, $lng, $lat, $radius, $quantile]);
if (!$result) {
    echo json_encode(["error" => "Lỗi khi truy vấn dữ liệu"]);
    exit;
}

$rows = [];
while ($row = pg_fetch_assoc($result)) {
    $rows[] = $row;
}

echo json_encode([
    "status" => "ok",
    "results" => $rows
]);
?>