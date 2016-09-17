"use strict";
const jQuery = require("jquery");
const $ = jQuery;
const bootstrap = require("bootstrap");
const fs = require("fs");
const {ipcRenderer} = require("electron");

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

// setting-general
let admins = [];
let channels = [];
let regexp = /^[a-zA-Z@][a-zA-Z0-9_]{3,29}[a-zA-Z0-9]$/;
// setting-account
let accounts = [];
// setting-location
let locationMap;
let patrolId = 0;
let markers = [];	// 額外加入 patrolId, patrolLocation {name, center, steps}

$(() => {
	$("#header").load("header.html");
	checkConfig();
});

function openLink(url) {
	ipcRenderer.send('open-link', url);
}

function checkConfig() {
	if (configGeneral == null || configAccount == null || configLocation == null) {
		$("#main").load("welcome.html");
	} else {
		// 全部都有
		$("#main").load("map.html");
	}
}

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

Math.floor6 = function(num) {
	return Math.floor(num * 1000000 + 0.5) / 1000000
}