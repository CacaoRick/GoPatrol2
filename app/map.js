"use strict";
$(() => {
    // 計算地圖的高度
	$(window).resize(function () {
		let h = $(window).height();
		let offsetTop = 52;		// Calculate the top offset
		let height = h - offsetTop;

		$("#map").css("height", height);
	}).resize();

    // 檢查是否有 googleMapsAPIKey
	if (typeof configGeneral.googleMapsAPIKey === "undefined" || configGeneral.googleMapsAPIKey == "") {
		console.log("Google Maps API key 未設定");
	} else {
		// 載入 API，載入完成後呼叫 initMap
		initGoogleMaps(initMap);
	}
});

// 初始化 map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 23.973285,
			lng: 120.9768753
		},
		zoom: 7,
		streetViewControl: false,
		disableDoubleClickZoom: true
	});

    updateBound(map);
}