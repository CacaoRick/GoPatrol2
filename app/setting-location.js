"use strict";
$(() => {
	$(window).resize(function () {
	var h = $(window).height(),
		offsetTop = 185; // Calculate the top offset

		$(".map-canvas").css("height", (h - offsetTop));
	}).resize();

	if (typeof configGeneral.googleMapsAPIKey === "undefined" || configGeneral.googleMapsAPIKey == "") {
		console.log("Google Maps API key 未設定");
	} else {
		initGoogleMaps(initLocationMap);
	}
});
