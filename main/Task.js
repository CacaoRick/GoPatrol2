"use strict";
const _ = require("lodash");
const moment = require("moment");
const Promise = require("bluebird");
const EventEmitter = require("events");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");
const Database = require("../util/Database.js");

class Task {
	constructor(event, database, patrols, location, option) {
		this.isRunning = false;
		this.startTime = null;
		this.event = event;
		this.database = database;
		this.patrols = patrols;
		this.center = location.center;
		this.steps = location.steps;
		this.option = option;		// {switchModeTime, requestDelay}
		this.hexPoints = [];		// {latitude, longitude}
		this.spawnPoints = [];		// {spawnpointId, latitude, longitude, type, disappearTime}

		this.bindEvent();
		this.configPoints();		// 算出 hexPoints 和抓出 spawnPoints
	}

	bindEvent() {
		this.event.on("start", () => {
			console.log("task on start");
			if (!this.isRunning) {
				this.isRunning = true;
				this.start();
			}
		});

		this.event.on("stop", () => {
			console.log("task on stop");
			this.isRunning = false;
		});
	}

	configPoints() {
		// 算出 hexPoints
		this.hexPoints = hexGrid.computePatrolPoints(this.center, this.steps);
		// 清空 spawnPoints
		this.spawnPoints = [];
		// 從資料庫抓出 spawnPoints

		// 留下範圍內的 spawnPoints

	}

	start() {
		if (this.startTime == null) {
			this.startTime = moment();
		}
		
		// 判斷是否改用 SpawnpointMode
		if (moment().isAfter(this.startTime.add(this.option.switchModeTime, "m"))) {
			// SpawnpointMode
			
		} else {
			// HexpointMode
			let hexPointForPatrols = this.assignHexPoints(this.hexPoints);
			let patrolPromises = [];
			this.patrols.forEach((patrol, index) => {
				patrol.setPoints(hexPointForPatrols[index]);
				patrolPromises.push(patrol.run());
			});

			new Promise.all(patrolPromises)
				.map(result => {
					if (result.error) {
						this.event.emit("accountError", result.account, result.error);
						this.removeAccount(result.username);
					}
				})
				.then(() => {
					if (this.isRunning) {
						setTimeout(() => {
							this.start();
						}, this.option.requestDelay);
					}
				});
		}
	}

	// 分配各 patrol 的 hexpoint
	assignHexPoints(hexPoints) {
		let avgPoints = Math.floor(hexPoints.length / this.patrols.length);
		let lastPoints = hexPoints.length % this.patrols.length;

		// 先平均分配
		let assignAmounts = _.fill(Array(this.patrols.length), avgPoints);

		// 把剩下的數量分掉
		for (let i = 0; i < lastPoints; i++) {
			assignAmounts[i]++;
		}

		// 分配 hexPoint
		let hexPointForPatrols = [];
		assignAmounts.forEach((amount, index) => {
			hexPointForPatrols[index] = _.take(hexPoints, amount);
			hexPoints = _.drop(hexPoints, amount);
		});

		return hexPointForPatrols;
	}
}

module.exports = Task;