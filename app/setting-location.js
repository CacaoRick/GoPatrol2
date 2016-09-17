"use strict";
$(() => {
	$(window).resize(function () {
	var h = $(window).height(),
		offsetTop = 215; // Calculate the top offset

		$(".map-canvas").css("height", (h - offsetTop));
	}).resize();

	if (typeof configGeneral.googleMapsAPIKey === "undefined" || configGeneral.googleMapsAPIKey == "") {
		console.log("Google Maps API key 未設定");
	} else {
		initGoogleMaps(initLocationMap);
	}
});

// 初始化 LocationMap
function initLocationMap() {
	locationMap = new google.maps.Map(document.getElementById('location-map'), {
		center: {lat: 23.973285, lng: 120.9768753},
		zoom: 7,
		streetViewControl: false,
		disableDoubleClickZoom: true
	});

	// 雙擊加入新的巡邏中心
	locationMap.addListener("dblclick", event => {
		addLocation(event.latLng, locationMap);
	});
}

// 加入新巡邏中心
function addLocation(latLng, map) {
	var marker = new google.maps.Marker({
			position: latLng,
			map: map
	});
	map.panTo(latLng);

	
}