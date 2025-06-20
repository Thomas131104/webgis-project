document.addEventListener("DOMContentLoaded", function () {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLatLng = [position.coords.latitude, position.coords.longitude];
        window.map = L.map('map').setView(userLatLng, 6);

        // Lớp nền bản đồ
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Tải bản đồ Việt Nam
        fetch("/webgis_project/data/vietnam_full.geojson")
          .then(response => response.json())
          .then(data => {
            // Hiển thị polygon Việt Nam
            const vnLayer = L.geoJSON(data, {
              style: {
                weight: 2,
                fillOpacity: 0.1
              }
            }).addTo(map);

            // Kiểm tra xem user có nằm trong lãnh thổ Việt Nam
            const multipolygon = data.features[0].geometry.coordinates;
            const userPoint = [userLatLng[1], userLatLng[0]]; // lng, lat
            let inside = false;

            for (let i = 0; i < multipolygon.length; i++) {
              const polygon = multipolygon[i][0]; // outer ring
              if (pointInPolygon(userPoint, polygon)) {
                inside = true;
                break;
              }
            }

            if (!inside) {
              alert("Vị trí của bạn không nằm trong lãnh thổ Việt Nam.");
              document.body.innerHTML = "<h3 style='text-align:center; margin-top: 20vh;'>Bạn không nằm trong lãnh thổ Việt Nam.</h3>";
              return;
            }

            // Vẽ lớp mask (che toàn bộ thế giới trừ Việt Nam)
            const world = [
              [ [-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90] ]
            ];
            const maskFeature = {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [...world, ...multipolygon.map(p => p[0])] // các polygon ngoài
              }
            };
            L.geoJSON(maskFeature, {
              style: {
                fillColor: '#000',
                fillOpacity: 0.75,
                color: '#000',
                weight: 0
              },
              interactive: false
            }).addTo(map);

            // Marker người dùng
            const userIcon = L.icon({
              iconUrl: 'images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [0, -30],
              shadowUrl: "images/marker-shadow.png",
              shadowSize: [41, 41],
              shadowAnchor: [12, 41]
            });

            L.marker(userLatLng, { icon: userIcon }).addTo(map)
              .bindPopup("Bạn đang ở đây.")
              .openPopup();

            const radiusMeters = 50;
            const point = L.latLng(...userLatLng);
            const bounds = point.toBounds(radiusMeters * 2);
            map.fitBounds(bounds);

          })
          .catch(() => {
            alert("Không thể tải bản đồ Việt Nam.");
            document.body.innerHTML = "<h3 style='text-align:center; margin-top: 20vh;'>Lỗi tải bản đồ Việt Nam.</h3>";
          });
      },


      function () {
        alert("Trang web này yêu cầu quyền truy cập vị trí để hoạt động.\nVui lòng tải lại và cho phép định vị.");
        document.body.innerHTML = "<h3 style='text-align:center; margin-top: 20vh;'>Trang bị khóa vì không có quyền truy cập vị trí.<br>Vui lòng tải lại và cho phép định vị.</h3>";
      }
    );
  } else {
    document.body.innerHTML = "<h3 style='text-align:center; margin-top: 20vh;'>Trình duyệt không hỗ trợ định vị vị trí.</h3>";
  }
});



// Hàm kiểm tra điểm có nằm trong polygon không
function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-10) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
