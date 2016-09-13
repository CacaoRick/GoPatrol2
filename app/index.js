const jQuery = $ = require("jquery");
const bootstrap = require("bootstrap");
const bootstrapTable = require("bootstrap-table");
const {ipcRenderer} = require("electron");

var config = null;
try {
	config = require("./config.json");
} catch(e) {
	console.log("找不到 config.json，載入預設值");
}

$(() => {
	$("#header").load("header.html");

	if (config == null) {
		$("#main").load("welcome.html");
	} else {
		$("#main").load("map.html");
	}
});

function openLink(url) {
	ipcRenderer.send('open-link', url);
}