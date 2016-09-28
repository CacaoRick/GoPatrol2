"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Task = require("./Task.js");

class GoPatrol extends EventEmitter {
	constructor() {
		super();
		this.isRunning = false;
		this.tasks = [];
		this.bindEvent();
	}

	deleteTask() {
		this.removeAllListeners();
		this.tasks.forEach(task => {
			task = null;
		})
		this.tasks = [];
	}

	assignTask() {
		this.config.location.forEach(location => {
			let task = new Task(this.config, this);
			this.tasks.push(task);

			// 找出特定任務名稱的帳號
			let accounts = _.filter(this.config.account, account => {
				return account.task == location.name;
			});

			// 設定 task
			task.assignTask(location, accounts);
		});
	}

	setConfig(config) {
		this.config = config;
		this.stop();
		this.deleteTask();
		this.assignTask();
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			console.log("gopatrol emit start");
			this.emit("start");
		} else {
			console.log("gopatrol emit start but is running");
		}
	}

	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			console.log("gopatrol emit stop");
			this.emit("stop");
		}
	}

	bindEvent() {
		this.on("scannedPoint", point => {
			this.emit("stop");
		});

		this.on("newPokemon", pokemon => {
			console.log(pokemon);
		});
	}
}

module.exports = GoPatrol;