"use strict";
$(() => {
	// 計算地圖和要裝 Location List 的 Menu 高度
	$(window).resize(function () {
		let h = $(window).height();
		let offsetTop = 195;		// Calculate the top offset
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
	fs.writeFile("./config-location.json", json, { flag: "w" }, (err) => {
		if (err == null) {
			console.log("儲存成功");
		} else {
			console.log(err);
		}
	});
	// 將設定送給 main.js
	sendConfig({ location: configLocation });
}

// 讀取設定
function loadConfig() {
	try {
		// 讀取 json 設定檔
		configLocation = loadJsonConfig(pathLocation);
		// 從設定檔產生 Markers
		createMarkers();
	} catch (e) {
		console.log(e);
	}
	// 移動地圖
	updateBound(locationMap);
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
	configLocation.forEach(config => {
		// 準備 patrolLocation 物件
		let patrolLocation = jQuery.extend(true, {}, config);
		addMarker(patrolLocation);
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
function addMarker(patrolLocation) {
	// 儲存巡邏範圍的圓
	let patrolCircels = [];
	// 算出所有巡邏點
	let patrolPoints = hexGrid.computePatrolPoints(patrolLocation.center, patrolLocation.steps);
	// 將每個要巡邏的點畫出圓形範圍
	patrolPoints.forEach(point => {
		patrolCircels.push(drawPatrolCircle(point));
	});

	// 在地圖上加入 marker
	let marker = new google.maps.Marker({
		position: new google.maps.LatLng(patrolLocation.center.latitude, patrolLocation.center.longitude),
		// 標記可移動
		draggable: true,
		map: locationMap,
		// 存入 infoWindow
		infoWindow: new google.maps.InfoWindow({
			content: patrolLocation.name
		}),
		// 儲存一個流水號 ID，用來找到 marker
		patrolId: patrolId++,
		// 巡邏位置物件
		patrolLocation: patrolLocation,
		// 儲存所有 google map 的圓物件
		patrolCircels: patrolCircels
	});

	// 按下 marker 會顯示 infoWindow
	marker.addListener("click", () => {
		// 將 infoWindow 的內容設為巡邏位置的名稱
		marker.infoWindow.setContent(marker.patrolLocation.name);
		// 顯示 infoWindow
		marker.infoWindow.open(marker.map, marker);
	});

	// 移動完畢，更新座標和周圍的巡邏範圍
	marker.addListener("dragend", event => {
		// 更改 patrolLocation 的 center 位置
		marker.patrolLocation.center.latitude = Math.decimal6(event.latLng.lat());
		marker.patrolLocation.center.longitude = Math.decimal6(event.latLng.lng());
		// 重新產生 Location List
		updateLocationList();
		// 移除巡邏範圍的圓
		removePatrolCircles(marker);
		// 重畫巡邏點和範圍
		redrawPatrolCircle(marker);

		console.log(configLocation[0].center);
	});

	// 存入 marker
	markers.push(marker);
}

// 畫出巡邏點的圓形範圍
function drawPatrolCircle(point) {
	return new google.maps.Circle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.4,
		strokeWeight: 1,
		fillColor: '#FF0000',
		fillOpacity: 0.1,
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

	// 產生一個不重複的名稱
	let num = 1;
	let name = null;
	while(name == null) {
		let index = _.findIndex(markers, marker => {
			return marker.patrolLocation.name == `巡邏位置 ${num}`
		});
		if (index == -1) {
			name = `巡邏位置 ${num}`;
		} else {
			num++;
		}
	}

	// 準備 patrolLocation 物件
	let location = {
		// 臨時取名 巡邏位置加上流水號
		name: name,
		// 巡邏範圍的中心，座標取道小數後六位
		center: center,
		// 巡邏範圍
		steps: 2
	};

	// 在地圖上加入 marker
	addMarker(location);

	// 移動地圖
	updateBound(locationMap);
	// 重新產生 Location List
	updateLocationList();
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
	// 重新設定 .editable 和 .editable-input 的事件
	bindEditableEvent();

	// 刪除按鈕
	$("button#remove").click(event => {
		let button = $(event.target).parent();
		let patrolId = button.attr("data-patrolId");
		// 找出這個位置的 marker
		let index = indexOfMarker(patrolId);
		// 從地圖移除這個 marker 和他的 patrolCircels
		removeMarkerAndCircles(markers[index]);
		// 從 markers 移除這個 marker
		markers.splice(index, 1);
		// 重新讀取 markers 產生 LocationList
		updateLocationList();
	});
}

function bindEditableEvent() {
    $(".editable").off("click");
    $(".editable-input").off("focusout");
	$(".editable-input").off("keypress");

	$(".editable").click(event => {
		let editable = $(event.target);
		beginEdit(editable);
	});

	$(".editable-input").focusout(event => {
		let input = $(event.target);
		saveInput(input);
	});

	$(".editable-input").keypress(event => {
		if (event.which == 13) {
			let input = $(event.target);
			saveInput(input);
		}
	});
}

function beginEdit(editable) {
	let input = editable.parent().find(".editable-input");
	input.val(editable.text());
	editable.hide();
	input.show();
	input.focus();
}

function saveInput(input) {
	console.log("saveInput");
	let ok = true;
	let marker = markers[indexOfMarker(input.attr("data-patrolId"))];
	switch (input.attr("id")) {
		case "name":
			let newName = input.val();
			let oldName = marker.patrolLocation.name; 
			if (oldName == "" || newName != oldName) {
				// 名稱有改變，檢查是否有重複
				let index = _.findIndex(markers, marker => {
					return marker.patrolLocation.name == newName
				});
				if (index == -1) {
					// 未重複
					// 更改 marker 中 patrolLocation 的名稱
					marker.patrolLocation.name = newName;
				} else {
					// 重複
					ok = false;
					// 提示
					console.log("名稱重複");
					// 再度 focus
					input.focus();
				}
			}
			break;
		case "lat":
			// 更改 patrolLocation 的位置
			marker.patrolLocation.center.latitude = input.val();
			// 更改 marker 位置
			moveMarker(marker);
			break;
		case "lng":
			// 更改 patrolLocation 的位置
			marker.patrolLocation.center.longitude = input.val();
			// 更改 marker 位置
			moveMarker(marker);
			break;
		case "steps":
			// 更改 patrolLocation 的巡邏範圍
			marker.patrolLocation.steps = input.val();
			// 移除巡邏範圍的圓
			removePatrolCircles(marker);
			// 重畫巡邏點和範圍
			redrawPatrolCircle(marker);
			break;
	}
	if (ok) {
		endEdit(input);
	}
}

function endEdit(input) {
	console.log("endEdit");
	let editable = input.parent().find(".editable");
	editable.text(input.val());
	input.hide();
	editable.show();
}

// 找出 patrolId 的 marker 在 markers 中的 index 
function indexOfMarker(patrolId) {
	return markers.map(marker => {
		return marker.patrolId.toString();
	}).indexOf(patrolId);
}

// 從地圖中移除 marker 中的 patrolCircles
function removeMarkerAndCircles(marker) {
	removePatrolCircles(marker)
	marker.setMap(null);
}

// 從地圖中移除 marker 中的 patrolCircles
function removePatrolCircles(marker) {
	marker.patrolCircels.forEach(circle => {
		circle.setMap(null);
	});
}

// 更改 marker 位置
function moveMarker(marker) {
	marker.setPosition(new google.maps.LatLng(marker.patrolLocation.center.latitude, marker.patrolLocation.center.longitude));
	// 移除巡邏範圍的圓
	removePatrolCircles(marker);
	// 重畫巡邏點和範圍
	redrawPatrolCircle(marker);
}

// 重畫巡邏點和範圍
function redrawPatrolCircle(marker) {
	// 清空 marker 中的 patrolCircles
	marker.patrolCircels = [];
	// 重新算出所有巡邏點
	let patrolPoints = hexGrid.computePatrolPoints(marker.patrolLocation.center, marker.patrolLocation.steps);
	// 將每個要巡邏的點畫出圓形範圍
	patrolPoints.forEach(point => {
		marker.patrolCircels.push(drawPatrolCircle(point));
	});
}

// 插入 location list
function appendLocationList(id, name, lat, lng, steps) {
	let li =
		`<li class="list-group-item">
		<p>
			<strong id="name" class="editable list-group-item-heading">${name}</strong>
			<input id="name" type="text" class="editable-input form-control" data-patrolId="${id}" style="width: 160px; display: none;" value="${name}">
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
					<input id="steps" type="number" class="editable-input form-control" data-patrolId="${id}" style="width: 100px; display: none;" min="1" value="${steps}">
				</div>
			</form>
		</div>
	</li>`;
	$("ul#location-list").append(li);
}