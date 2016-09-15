const jQuery = $ = require("jquery");
const bootstrap = require("bootstrap");
const {ipcRenderer} = require("electron");

let configGeneral = null;
let configAccount = null;
let configLocation = null;
try {
	configGeneral = require("./config-general.json");
	configAccount = require("./config-account.json");
	configLocation = require("./config-location.json");
} catch(e) {
	console.log("找不到 config，前往設定頁面");
}

$(() => {
	$("#header").load("header.html");

	if (configGeneral == null || configAccount == null || configLocation == null) {
		$("#main").load("welcome.html");
	} else {
		// 全部都有
		$("#main").load("map.html");
	}
});

function openLink(url) {
	ipcRenderer.send('open-link', url);
}