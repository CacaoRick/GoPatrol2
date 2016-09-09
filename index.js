const {ipcRenderer} = require('electron');
const $ = require('jquery');
var defaultConfig = require('./default.json');

$(document).ready(() => {

	$('#btn').click(() => {
		console.log('jq click');
		ipcRenderer.send('btn-click');
	});

	console.log(defaultConfig.googleMapAPIKey);
});

ipcRenderer.on('btn-click-check', (event, arg) => {
	console.log(event);
	console.log(arg);
	$('#show').text($('#show').text() + arg);
});