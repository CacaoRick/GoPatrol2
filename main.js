'use strict';
const {app, BrowserWindow, ipcMain} = require('electron');

// 儲存一個全域的 window 物件（瀏覽器視窗物件），才不會被 Javascript 清垃圾的時候把視窗關掉，若有多個視窗要用陣列來存
let win;

function createWindow() {
	// 建立瀏覽器視窗
	win = new BrowserWindow({width: 800, height: 600});

	// 讀取 index.html
	win.loadURL(`file://${__dirname}/index.html`);

	// 開啟 DevTool
	//win.webContents.openDevTools();

	win.on('closed', () => {
		// 移除 window 物件的參考，通常若有多個視窗會用陣列來存，要將陣列中正確元素設為 null
		win = null;
	});
}

// 讓 createWindow 能在 Electron 完成初始化並準備好建立瀏覽器視窗時呼叫，有些 API 只能在這個事件之後使用
app.on('ready', createWindow);

// 在所有視窗被關閉後結束程式
app.on('window-all-closed', () => {
	// 類似 MacOS 關閉視窗後他還是會在活 Dock 上，要用 Cmd + Q 才會真的關掉
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// 類似 MacOS 在沒有視窗開啟的狀況下點擊 Dock Icon 會重新開啟視窗
	if (win === null) {
		createWindow();
	}
});

// ipcMain.on('asynchronous-message', (event, arg) => {
// 	console.log(arg);  // prints "ping"
// 	event.sender.send('asynchronous-reply', 'pong');
// });
//
// ipcMain.on('synchronous-message', (event, arg) => {
// 	console.log(arg);  // prints "ping"
// 	event.returnValue = 'pong';
// });

ipcMain.on('btn-click', (event, arg) => {
	console.log(arg);
	console.log('main process recive btn-click');
	event.sender.send('btn-click-check', 'OK');
});