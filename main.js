"use strict";
const {app, ipcMain, shell, BrowserWindow} = require("electron");

// 儲存一個全域的 window 物件（瀏覽器視窗物件），才不會被 Javascript 清垃圾的時候把視窗關掉，若有多個視窗要用陣列來存
let win;
let config = {};

function createWindow() {
	// 建立瀏覽器視窗
	win = new BrowserWindow({
		"width": 1024,
		"height": 768,
		"minWidth": 1024,
		"minHeight": 768
	});

	// 讀取 index.html
	win.loadURL(`file://${__dirname}/app/index.html`);

	// 開啟 DevTool
	win.webContents.openDevTools();

	win.on("closed", () => {
		// 移除 window 物件的參考，通常若有多個視窗會用陣列來存，要將陣列中正確元素設為 null
		win = null;
	});
}

// 讓 createWindow 能在 Electron 完成初始化並準備好建立瀏覽器視窗時呼叫，有些 API 只能在這個事件之後使用
app.on("ready", createWindow);

// 在所有視窗被關閉後結束程式
app.on("window-all-closed", () => {
	// 類似 MacOS 關閉視窗後他還是會在活 Dock 上，要用 Cmd + Q 才會真的關掉
	if (process.platform !== "darwin") {
		console.log("App Quit.");
		app.quit();
	}
});

app.on("activate", () => {
	// 類似 MacOS 在沒有視窗開啟的狀況下點擊 Dock Icon 會重新開啟視窗
	if (win === null) {
		createWindow();
	}
});

// 用瀏覽器開啟連結，arg 是網址
ipcMain.on('open-link', (event, arg) => {
	shell.openExternal(arg);
})

// 收到設定後覆寫 config
ipcMain.on("set-config", (event, arg) => {
	if (arg.general){
		config.general = arg.general;
	}
	if (arg.account){
		config.account = arg.account;
	}
	if (arg.location){
		config.location = arg.location;
	}
})