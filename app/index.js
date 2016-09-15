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