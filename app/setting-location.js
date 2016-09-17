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

// 加入新巡邏中心
function addLocation(latLng, map) {
	var marker = new google.maps.Marker({
			position: latLng,
			map: map
	});
	map.panTo(latLng);

	
}