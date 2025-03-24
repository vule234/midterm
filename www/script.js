(() => {
    const { LocalNotifications, Share, Geolocation } = Capacitor.Plugins;

    window.convertTemperature = function () {
        let celsius = document.getElementById("celsiusInput").value;
        if (celsius === "") {
            alert("Vui lòng nhập nhiệt độ!");
            return;
        }

        let fahrenheit = (celsius * 9/5) + 32;
        document.getElementById("result").innerText = `Nhiệt độ (°F): ${fahrenheit.toFixed(2)}`;

        if (Capacitor.isNativePlatform()) {
            showNotification(fahrenheit);
        } else {
            alert(`Nhiệt độ F: ${fahrenheit.toFixed(2)}°F`);
        }
    };

    async function showNotification(fahrenheit) {
        if (!Capacitor.isNativePlatform()) {
            console.log("Local Notifications không hỗ trợ trên Web.");
            return;
        }

        await LocalNotifications.schedule({
            notifications: [{
                title: "Chuyển đổi thành công!",
                body: `Nhiệt độ F: ${fahrenheit.toFixed(2)}°F`,
                id: 1
            }]
        });
    }

    window.shareResult = async function () {
        let resultText = document.getElementById("result").innerText;

        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title: "Kết quả chuyển đổi nhiệt độ",
                text: resultText,
                dialogTitle: "Chia sẻ"
            });
        } else if (navigator.share) {
            try {
                await navigator.share({
                    title: "Kết quả chuyển đổi nhiệt độ",
                    text: resultText,
                });
            } catch (error) {
                alert("Không thể chia sẻ!");
            }
        } else {
            alert("Trình duyệt không hỗ trợ chia sẻ!");
        }
    };

    window.getLocation = async function () {
        if (Capacitor.isNativePlatform()) {
            try {
                const coordinates = await Geolocation.getCurrentPosition();
                getCityFromCoordinates(coordinates.coords.latitude, coordinates.coords.longitude);
            } catch (error) {
                alert("Không thể lấy vị trí!");
            }
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    getCityFromCoordinates(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    alert("Không thể lấy vị trí: " + error.message);
                }
            );
        } else {
            alert("Trình duyệt không hỗ trợ lấy vị trí.");
        }
    };

    async function getCityFromCoordinates(lat, lon) {
        try {
            let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            let data = await response.json();

            if (data.address && data.address.city) {
                alert(`Bạn đang ở: ${data.address.city}, ${data.address.country}`);
            } else {
                alert("Không thể xác định thành phố!");
            }
        } catch (error) {
            alert("Lỗi khi lấy tên thành phố!");
        }
    }
})();
