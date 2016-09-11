const jQuery = $ = require('jquery');
const bootstrap = require('bootstrap');
const {ipcRenderer} = require('electron');

let defaultConfig = require('./default.json');
var config = null;
try {
	config = require("./config.json");
} catch(e) {
	console.log("找不到 config.json，載入預設值");
}

$(() => {
	$('#header').load('header.html');

	if (config == null) {
		$('#main').load('setting-general.html');
	} else {
		$('#main').load('map.html');
	}
});