let markers = []; // ✅ Đặt ngoài cùng

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("input");

    // Dùng biến flag để đảm bảo chỉ gắn event submit một lần
    let isFormEventAttached = false;

    navigator.geolocation.watchPosition(
        (position) => {
            const userLatLng = [
                position.coords.latitude,
                position.coords.longitude
            ];

            // Gắn sự kiện submit một lần duy nhất
            if (!isFormEventAttached) {
                form.addEventListener("submit", function(e) {
                    onFormSubmit(userLatLng)(e);
                });
                isFormEventAttached = true;
            }
        },

        (error) => {
            console.error("❌ Không lấy được tọa độ:", error.message);
        }
    );
});

function onFormSubmit(userLatLng) {
    return function (e) {
        e.preventDefault();

        let radius = parseFloat(document.getElementById("radius").value);
        if (radius === 0) {
            alert("Không được nhập bán kính khu vực là 0.");
            return;
        }

        let unit = document.getElementById("meter").value;
        if (unit === "kilometer") {
            radius *= 1000;
        }

        let type = document.getElementById("type").value;
        let quantile = parseInt(document.getElementById("quantile").value);

        const data = {
            location: {
                lat: userLatLng[0],
                lng: userLatLng[1]
            },
            radius: radius,
            type: type,
            quantile: quantile
        };


        
        let iconLink = "";

        fetch("../data/normalization.json")
            .then(response => response.json())
            .then(normalizationData => {
                if (normalizationData[type] && normalizationData[type].link) {
                    iconLink = normalizationData[type].link;
                } else {
                    console.warn("⚠ Không tìm thấy icon cho loại:", type);
                }

                return fetch("http://localhost/webgis_project/api/query.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
            })
            .then(res => res.json())
            .then(result => {

                if (!window.map) {
                    console.error("❌ Bản đồ chưa được khởi tạo.");
                    return;
                }



                // ❌ XÓA MARKERS CŨ
                markers.forEach(marker => {
                    window.map.removeLayer(marker);
                });
                markers = [];



                // 🧾 Xóa nội dung bảng cũ (nếu có bảng)
                const tableBody = document.querySelector("#result-table tbody");
                if (tableBody) {
                    tableBody.innerHTML = "";
                }



                // ✅ THÊM MARKERS MỚI + DÒNG MỚI VÀO BẢNG
                result.results.forEach(place => {
                    const label = place.name || `Địa điểm #${place.id}`;
                    const distance = Math.round(parseFloat(place.distance)); // Lấy distance server, làm tròn

                    const marker = L.marker([parseFloat(place.lat), parseFloat(place.lng)], {
                        icon: L.icon({
                            iconUrl: "/webgis_project/" + iconLink,
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                            popupAnchor: [0, -32],
                            shadowUrl: "/webgis_project/images/marker-shadow.png",
                            shadowSize: [41, 41],
                            shadowAnchor: [13, 41]
                        })
                    }).addTo(window.map);

                    // Thêm row vào bảng (nếu có)
                    if (tableBody) {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${place.id}</td>
                            <td>${label}</td>
                            <td>${distance} m</td>
                        `;
                        row.style.cursor = "pointer";

                        let message = `
                            <strong>ID:</strong> ${place.id}<br>
                            <strong>Tên:</strong> ${label}<br>
                            <strong>Khoảng cách:</strong> ${distance} m
                        `;
                        marker.bindPopup(message);

                        row.addEventListener("click", () => {
                            window.map.setView([parseFloat(place.lat), parseFloat(place.lng)], 16);
                            marker.openPopup();
                        });
                        tableBody.appendChild(row);
                    }

                    markers.push(marker);
                });





                

                if (result.results.length > 0) {
                    const first = result.results[0];
                    window.map.setView([first.lat, first.lng], 14);
                }
            })
            .catch(err => {
                console.error("❌ Lỗi khi xử lý:", err);
            });
    };
}
