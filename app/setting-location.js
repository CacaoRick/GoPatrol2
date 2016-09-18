"use strict";
$(() => {
	// 計算地圖和要裝 Location List 的 Menu 高度
	$(window).resize(function () {
		let h = $(window).height();
		let offsetTop = 215;		// Calculate the top offset
		let height = h - offsetTop;

		$(".map-canvas").css("height", height);
		$(".map-menu").css("height", height);
	}).resize();

	// 檢查是否有 googleMapsAPIKey
	if (typeof configGeneral.googleMapsAPIKey === "undefined" || configGeneral.googleMapsAPIKey == "") {
		console.log("Google Maps API key 未設定");
	} else {
		// 載入 API，載入完成後呼叫 initLocationMap
		initGoogleMaps(initLocationMap);
	}

	// 註冊設定頁面三個按鈕
	$("button#save").click(saveConfig);
	$("button#reload").click(loadConfig);
	$("button#reset").click(resetConfig);
});

// 初始化 LocationMap
function initLocationMap() {
	locationMap = new google.maps.Map(document.getElementById('location-map'), {
		center: {
			lat: 23.973285,
			lng: 120.9768753
		},
		zoom: 7,
		streetViewControl: false,
		disableDoubleClickZoom: true
	});

	// 雙擊加入新的巡邏中心
	locationMap.addListener("dblclick", event => {
		addLocation(event.latLng);
	});

	// 載入設定檔
	loadConfig();
}

// 儲存設定
function saveConfig() {
	// 將 markers 中的 patrolLocation 取出，存入 configLocation
	configLocation = markers.map(marker => {
		return marker.patrolLocation;
	});

	// 將設定物件轉為 json 格式存到檔案中
	let json = JSON.stringify(configLocation, null, "\t");
	fs.writeFile("./config-location.json", json, { flag : "w" }, (err) => {
		if (err == null) {
			console.log("儲存成功");
		} else {
			console.log(err);
		}
	});
}

// 讀取設定
function loadConfig() {
	try {
		// 讀取 json 設定檔
		configLocation = require("../config-location.json");
		// 從設定檔產生 Markers
		createMarkers();
	} catch(e) {
		console.log(e);	
	}
	// 移動地圖
	updateBound();
	// 更新 Location List
	updateLocationList();
}

// 清空設定
function resetConfig() {
	// 清空地圖上的 marker
	removeAllMarkers();
	// 更新 Location List
	updateLocationList();
}

// 從設定檔產生 Markers
function createMarkers() {
	// 清空地圖上的 marker
	removeAllMarkers();
	// 從 configLocation 中加入 markers
	configLocation.forEach(location => {
		addMarker(location);
	});
}

// 移除所有 Marker
function removeAllMarkers() {
	markers.forEach(marker => {
		removeMarkerAndCircles(marker);
	});
	markers = [];
}

// 加入新 Marker
function addMarker(location) {
	// 儲存巡邏範圍的圓
	let patralCircels = [];
	// 算出所有巡邏點
	let patrolPoints = hexGrid.computePatrolPoints(location.center, location.steps);
	// 將每個要巡邏的點畫出圓形範圍
	patrolPoints.forEach(point => {
		patralCircels.push(drawPatrolCircle(point));
	});

	// 在地圖上加入 marker
	let marker = new google.maps.Marker({
		position: new google.maps.LatLng(location.center.latitude, location.center.longitude),
		map: locationMap,
		// 儲存一個流水號 ID，用來找到 marker
		patrolId: patrolId++,
		// 巡邏位置物件
		patrolLocation: location,
		// 儲存所有 google map 的圓物件
		patralCircels: patralCircels 
	});

	// 存入 marker
	markers.push(marker);
}

// 畫出巡邏點的圓形範圍
function drawPatrolCircle(point) {
	return new google.maps.Circle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.6,
		strokeWeight: 1,
		fillColor: '#FF0000',
		fillOpacity: 0.2,
		map: locationMap,
		center: new google.maps.LatLng(point.latitude, point.longitude),
		radius: 70
	});
}

// 加入新巡邏位置
function addLocation(latLng) {
	let center = {
		latitude: Math.decimal6(latLng.lat()),
		longitude: Math.decimal6(latLng.lng())
	}
	// 準備 patrolLocation 物件
	let location = {
		// 臨時取名 巡邏位置加上流水號
		name: `巡邏位置${patrolId + 1}`,
		// 巡邏範圍的中心，座標取道小數後六位
		center: center,
		// 巡邏範圍
		steps: 2
	};

	// 在地圖上加入 marker
	addMarker(location);

	// 移動地圖
	updateBound();
	// 重新產生 Location List
	updateLocationList();
}

// 讓所有物件在地圖中被看到
function updateBound() {
	// 沒 marker 就不移動
	if (markers.length > 0) {
		let latlngbounds = new google.maps.LatLngBounds;
		// 將每個巡邏點的圓形的 bounds 和 latlngbounds 連集
		markers.forEach(marker => {
			marker.patralCircels.forEach(circle => {
				latlngbounds.union(circle.getBounds());
			});
		});

		// 移動地圖到 bounds 的中心
		locationMap.setCenter(latlngbounds.getCenter());
		// 縮放地圖讓 bounds 能全部被看見
		locationMap.fitBounds(latlngbounds);
	}
}

// 讀取 markers 重新產生 Location List
function updateLocationList() {
	// 選取 location list
	let locationList = $("#location-list");
	// 清空 location list
	locationList.empty();
	// 插入每個 marker 中的 location
	markers.forEach(marker => {
		let id = marker.patrolId;
		let location = marker.patrolLocation;
		// 插入 Location list
		appendLocationList(id, location.name, location.center.latitude, location.center.longitude, location.steps)
	});
	// 重新設定 location list 中的各按鈕、輸入欄位的事件
	bindLocationListEvent();
}

// 重新設定 location list 中的各按鈕、輸入欄位的事件
function bindLocationListEvent() {
	// 來自 editable.js，用來重新設定 .editable 和 .editable-input 的事件
	bindEditableEvent();

	// 刪除按鈕
	$("button#remove").click(event => {
		let button = $(event.target).parent();
		let patrolId = button.attr("data-patrolId");
		// 找出這個位置的 marker
		let index = indexOfMarker(patrolId);
		// 從地圖移除這個 marker 和他的 patralCircels
		removeMarkerAndCircles(markers[index]);
		// 從 markers 移除這個 marker
		markers.splice(index, 1);
		// 重新讀取 markers 產生 LocationList
		updateLocationList();
	});

	// 編輯名稱

	// 編輯座標

	// 編輯範圍
	
}

// 找出 patrolId 的 marker 在 markers 中的 index 
function indexOfMarker(patrolId) {
	return markers.map(marker => {
		return marker.patrolId.toString();
	}).indexOf(patrolId);
}

// 從地圖中移除 marker 中的 patrolCircles
function removeMarkerAndCircles(marker) {
	marker.setMap(null);
	marker.patralCircels.forEach(circle => {
		circle.setMap(null);
	});
}

// 插入 location list
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