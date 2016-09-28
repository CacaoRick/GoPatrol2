"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Promise = require("bluebird");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");

class Task {
	constructor(config, event) {
		this.config = config;
		this.event = event;
		this.isRunning = false;
		this.patrols = [];
		this.spawnpoints = [];
	}

	assignTask(location, accounts) {
		this.location = location;
		this.accounts = accounts;
		this.stop();
		this.assignPatrols();
	}

	assignPatrols() {
		this.deletePatrols();

		let patrolPoints = hexGrid.computePatrolPoints(this.location.center, this.location.steps);
		let pointsPerWorker = Math.floor(patrolPoints.length / this.accounts.length);
		let lastPoints = patrolPoints.length % this.accounts.length;

		this.accounts.forEach(account => {
			let getPoints = pointsPerWorker;
			if (lastPoints > 0) {
				getPoints++;
				lastPoints--;
			}
			let points = _.take(patrolPoints, getPoints);
			patrolPoints = _.drop(patrolPoints, getPoints);
			let patrol = new Patrol(this.config.general, account, this.event);
			patrol.setPoints(points);
			this.patrols.push(patrol);
		});

		this.bindEvent();
	}

	deletePatrols() {
		this.patrols.forEach(patrol => {
			patrol.taskStop = true;
			patrol = null;
		});
		this.patrols = [];
	}

	removeAccount(username) {
		this.accounts = _.remove(this.accounts, account => {
			return account.username == username;
		})
		this.assignPatrols();
	}

	start() {
		let patrolPromises = [];
		this.patrols.forEach(patrol => {
			patrol.taskStop = false;
			patrolPromises.push(patrol.run());
		});

		new Promise.all(patrolPromises)
			.map(result => {
				if (result.error) {
					this.event.emit("accountError", result.account, result.error);
					removeAccount(result.username);
				}
			})
			.then(() => {
				start();
			});
	}

	stop() {
		this.patrols.forEach(patrol => {
			patrol.taskStop = true;
		});
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
			this.stop();
		});
	}
}

module.exports = Task;