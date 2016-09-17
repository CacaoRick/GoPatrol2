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

// setting-general
let admins = [];
let channels = [];
let regexp = /^[a-zA-Z@][a-zA-Z0-9_]{3,29}[a-zA-Z0-9]$/;
// setting-account
let accounts = [];
let isLoadMapApi = false;
let locationMap;

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

function initLocationMap() {
	locationMap = new google.maps.Map(document.getElementById('location-map'), {
		center: {lat: 23.973285, lng: 120.9768753},
		zoom: 7
	});
}

function initGoogleMapsApi(){
	if (isLoadMapApi) {
		initLocationMap();
	} else {
		let script_tag = document.createElement("script");
		script_tag.setAttribute("type", "text/javascript");
		script_tag.setAttribute("src", `https://maps.googleapis.com/maps/api/js?key=${configGeneral.googleMapsAPIKey}&callback=initLocationMap`);
		(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
		isLoadMapApi = true;
	}
}