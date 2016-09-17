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

	// 註冊設定頁面三個按鈕
	$("button#save").click(saveConfig);
	$("button#reload").click(loadConfig);
	$("button#reset").click(resetConfig);
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
	let location = {
		name: `巡邏位置${patrolId + 1}`,
		latLng: {
			lat: Math.floor6(latLng.lat()),
			lng: Math.floor6(latLng.lng())
		},
		steps: 2
	};

	// 在地圖上加入 marker
	let marker = new google.maps.Marker({
		position: latLng,
		map: locationMap,
		patrolId: patrolId++,
		patrolLocation: location
	});
	markers.push(marker);

	// 移動地圖
	locationMap.panTo(latLng);
	locationMap.setZoom(15);
	
	updateLocationList();
}

function appendLocationList(id, name, lat, lng, steps) {
	let li = 
	`<li class="list-group-item">
		<p>
			<strong id="name" class="editable list-group-item-heading">${name}</strong>
			<input id="name" type="text" class="editable-input form-control" style="width: 160px; display: none;" value="${name}">
			<button id="remove" class="close" data-patrolId="${id}"><span aria-hidden="true">&times;</span></button>
		</p>
		<div class="list-group-item-text">
			<form class="form-inline">
				<div class="form-group"><span>緯度：</span>
					<span id="lat" class="editable" style="width: 120px color:blue;">${lat}</span>
					<input id="lat" type="number" class="editable-input form-control" data-patrolId="${id}" style="width: 140px; display: none;" value="${lat}">
				</div><br>
				<div class="form-group"><span>經度：</span>
					<span id="lng" class="editable" style="width: 120px">${lng}</span>
					<input id="lng" type="number" class="editable-input form-control" data-patrolId="${id}" style="width: 140px; display: none;" value="${lng}">
				</div><br>
				<div class="form-group"><span>範圍：</span>
					<span id="steps" class="editable" style="width: 120px">${steps}</span>
					<input id="steps" type="number" class="editable-input form-control" data-patrolId="${id}" style="width: 100px; display: none;" value="${steps}">
				</div>
			</form>
		</div>
	</li>`;
	$("ul#location-list").append(li);
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
	markers.forEach(marker => {
		let id = marker.patrolId;
		let location = marker.patrolLocation;
		// 插入 Location list
		appendLocationList(id, location.name, location.latLng.lat, location.latLng.lng, location.steps)
	});
	bindLocationListEvent();
}

function saveConfig() {
	// 將 markers 中的 patrolLocation 取出，存入 configLocation
	configLocation = markers.map(marker => {
		return marker.patrolLocation;
	});

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
		buildMarkers();
	} catch(e) {
		console.log(e);	
	}
	updateLocationList();
}

function buildMarkers() {
	// 清空地圖上的 marker
	removeAllMarkers();
	// 從 configLocation 中加入 markers
	configLocation.forEach(location => {
		// 在地圖上加入 marker
		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(location.latLng.lat, location.latLng.lng),
			map: locationMap,
			patrolId: patrolId++,
			patrolLocation: location
		});
		markers.push(marker);
	});
}

function resetConfig() {
	// 清空 markers 和地圖上的 marker
	removeAllMarkers();
	updateLocationList();
}

function bindLocationListEvent() {
	bindEditableEvent();

	$("button#remove").click(event => {
		let button = $(event.target).parent();
		let patrolId = button.attr("data-patrolId");
		// 找出這個位置的 Marker
		let index = indexOfMarker(patrolId);
		console.log(index);
		// 從地圖移除這個 Marker
		markers[index].setMap(null);
		// 從 Markers 移除這個 Marker
		markers.splice(index, 1);
		// 重新讀取 markers 產生 LocationList
		updateLocationList();
	});
}

function indexOfMarker(patrolId) {
	return markers.map(marker => {
		return marker.patrolId.toString();
	}).indexOf(patrolId);
}