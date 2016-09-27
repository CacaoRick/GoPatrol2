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

	setConfig(config) {
		this.config = config;

		// 分配任務
		this.config.location.forEach(location => {
			let task = new Task(location, this);
			this.tasks.push(task);

			// 找出特定任務名稱的帳號
			let accounts = _.filter(config.account, account => {
				return account.task == location.name;
			});

			task.setConfig(this.config);
			task.setAccount(accounts);
		});
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			console.log("emit start");
			this.emit("start");
		}
	}

	stop() {
		if (this.isRunning) {
			this.isRunning = false;
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