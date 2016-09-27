"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Promise = require("bluebird");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");

class Task extends EventEmitter {
	constructor(location, gopatrol) {
		super();
		this.gopatrol = gopatrol;
		this.isRunning = false;
		this.patrols = [];
		this.location = location;
		this.bindEvent();
	}

	setConfig(config) {
		this.config = config;
	}

	setAccount(accounts) {
		let patrolPoints = hexGrid.computePatrolPoints(this.location.center, this.location.steps);
		let pointsPerWorker = Math.floor(patrolPoints.length / accounts.length);
		let lastPoints = patrolPoints.length % accounts.length;

		accounts.forEach(account => {
			let getPoints = pointsPerWorker;
			if (lastPoints > 0) {
				getPoints++;
				lastPoints--;
			}

			let points = _.take(patrolPoints, getPoints);
			patrolPoints = _.drop(patrolPoints, getPoints);
			let patrol = new Patrol(this.config.general, account, this);
			patrol.setPoints(points);
			this.patrols.push(patrol);
		});
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			let runs = [];
			this.patrols.forEach(patrol => {
				runs.push(patrol.run());
			});

			new Promise.all(runs)
				.then(status => {
					this.isRunning = false;
					console.log(status);
				});
		}
	}

	stop() {
		if (this.isRunning) {
			this.isRunning = false;

		}
	}

	bindEvent() {
		this.gopatrol.on("start", () => {
			this.start();
		});

		this.gopatrol.on("stop", () => {
			this.stop();
		});

		this.on("scannedPoint", (point, cell) => {

		});

		this.on("scannedPoint", (account, error) => {

		});
	}
}

module.exports = Task;