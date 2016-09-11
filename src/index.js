const jQuery = $ = require('jquery');
const bootstrap = require('bootstrap');
const {ipcRenderer} = require('electron');
require('./header.js');

let defaultConfig = require('./default.json');
var config = null;
try {
	config = require("./config.json");
} catch(e) {
	console.log("找不到 config.json，載入預設值");
}