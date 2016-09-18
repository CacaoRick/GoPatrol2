"use strict";
require("./math-extand.js");
const hexGrid = require("./hex-grid.js");
const jQuery = require("jquery");
const $ = jQuery;
const fs = require("fs");
const bootstrap = require("bootstrap");
const {ipcRenderer} = require("electron");

// 設定檔
let configGeneral = null;
let configAccount = null;
let configLocation = null;
try {
	configGeneral = require(`../config-general.json`);
	configAccount = require("../config-account.json");
	configLocation = require("../config-location.json");
} catch(e) {
	console.log("找不到 config，前往設定頁面");
}
// Google Maps
let isLoadMapApi = false;

// map
let map;					// Google 地圖物件
let latlngbounds = null;	// 用來調整地圖顯示位置

// setting-general
let admins = [];	// 暫存管理員
let channels = [];	// 暫存頻道
let regexp = /^[a-zA-Z@][a-zA-Z0-9_]{3,29}[a-zA-Z0-9]$/;	// 用來檢查管理員使用者名稱和頻道ID
// setting-account
let accounts = [];	// 暫存帳號
// setting-location
let locationMap;	// 範圍設定用的 Google 地圖物件
let patrolId = 0;	// 建立巡邏範圍用的流水號
let markers = [];	// 額外加入 patrolId, patrolLocation {name, center, steps}

$(() => {
	// 載入 header
	$("#header").load("header.html");
	// 檢查設定檔
	checkConfig();
});

// 叫 main.js 用瀏覽器開啟連結
function openLink(url) {
	ipcRenderer.send('open-link', url);
}

// 檢查設定檔，若有缺少設定檔則開啟 welcome 頁面
function checkConfig() {
	if (configGeneral == null || configAccount == null || configLocation == null) {
		$("#main").load("welcome.html");
	} else {
		// 全部都有
		$("#main").load("map.html");
	}
}

// 用 config 中的 googleMapsAPIKey 載入 Google Maps Api
function initGoogleMaps(callback){
	if (isLoadMapApi) {
		callback();
	} else {
		let script_tag = document.createElement("script");
		script_tag.setAttribute("type", "text/javascript");
		script_tag.setAttribute("src", `https://maps.googleapis.com/maps/api/js?key=${configGeneral.googleMapsAPIKey}&libraries=geometry,drawing&callback=${callback.name}`);
		(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
		isLoadMapApi = true;
	}
}

// 讓所有物件在地圖中被看到
function updateBound(map) {
	// 如果 latlngbounds 還沒建立先弄一個出來
	if (latlngbounds == null) {
		latlngbounds = new google.maps.LatLngBounds;
	}

	// 沒 marker 就不移動
	if (markers.length > 0) {
		// 將每個巡邏點的圓形的 bounds 和 latlngbounds 連集
		markers.forEach(marker => {
			marker.patrolCircels.forEach(circle => {
				latlngbounds.union(circle.getBounds());
			});
		});

		// 移動地圖到 bounds 的中心
		map.setCenter(latlngbounds.getCenter());
		// 縮放地圖讓 bounds 能全部被看見
		map.fitBounds(latlngbounds);
	}
}