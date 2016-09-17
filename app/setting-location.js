"use strict";
$(() => {
	$(window).resize(function () {
		let h = $(window).height();
		let offsetTop = 215;		// Calculate the top offset
		let height = h - offsetTop;

		$(".map-canvas").css("height", height);
		$(".map-menu").css("height", height);
	}).resize();

	if (typeof configGeneral.googleMapsAPIKey === "undefined" || configGeneral.googleMapsAPIKey == "") {
		console.log("Google Maps API key 未設定");
	} else {
		initGoogleMaps(initLocationMap);
	}

	loadConfig();
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
		addLocation(event.latLng);
	});
}

// 加入新巡邏中心
function addLocation(latLng) {
	// 存入 locations
	locations.push({
		name: `巡邏範圍${locations.length + 1}`,
		latLng: {
			lat: latLng.lat(),
			lng: latLng.lng()
		},
		steps: 2
	});

	// 在地圖上加入 marker
	let marker = new google.maps.Marker({
			position: latLng,
			map: locationMap
	});
	markers.push(marker);

	// 移動地圖
	locationMap.panTo(latLng);
	locationMap.setZoom(15);
	
	updateLocationList();
}

// 移除所有 Marker
function removeAllMarkers() {
	markers.forEach(marker => {
		marker.setMap(null);
	});
	markers = [];
}

function updateLocationList() {
	let locationList = $("#location-list");
	locationList.empty();
	locations.forEach(location => {

	});
}

function saveConfig() {
	configLocation = locations;
	let json = JSON.stringify(configLocation, null, "\t");
	fs.writeFile("./config-location.json", json, { flag : "w" }, (err) => {
		if (err == null) {
			console.log("儲存成功");
		} else {
			console.log(err);
		}
	});
}

function loadConfig() {
	try {
		// 讀取 json 設定檔
		configLocation = require("../config-location.json");
		locations = configLocation;
	} catch(e) {
		console.log(e);	
	}
	buildMarkers();
	updateLocationList();
}

function buildMarkers() {
	// 清空地圖上的 marker
	removeAllMarkers();
	// 從 locations 中加入 markers
	locations.forEach(location => {
		// 在地圖上加入 marker
		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(location.latLng.lat, location.latLng.lng),
			map: locationMap
		});
		markers.push(marker);
	});
}

function resetConfig() {
	// 清空地圖上的 marker
	removeAllMarkers();
	// 清空 locations
	locations = [];
	updateLocationList();
}