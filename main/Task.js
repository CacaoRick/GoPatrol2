"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Promise = require("bluebird");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");

class Task extends EventEmitter {
	constructor(config, gopatrol) {
		super();
		this.config = config;
		this.gopatrol = gopatrol;
		this.isRunning = false;
		this.patrols = [];
		this.spawnpoints = [];
	}

	assignTask(location, accounts) {
		this.location = location;
		this.accounts = accounts;
		this.stop();
		this.deletePatrols();
		this.assignPatrols();
	}

	assignPatrols() {
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
			let patrol = new Patrol(this.config.general, account, this);
			patrol.setPoints(points);
			this.patrols.push(patrol);
		});

		this.bindEvent(); 
	}

	deletePatrols() {
		this.removeAllListeners();
		this.patrols.forEach(patrol => {
			patrol = null;
		});
		this.patrols = [];
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			let patrolPromises = [];
			this.patrols.forEach(patrol => {
				patrolPromises.push(patrol.run());
			});

			new Promise.all(patrolPromises)
				.then(status => {
					this.isRunning = false;
					console.log(status);
				});
		}
	}

	stop() {
		this.isRunning = false;
	}

	bindEvent() {
		this.gopatrol.on("start", () => {
			console.log("task on start");
			this.start();
		});

		this.gopatrol.on("stop", () => {
			console.log("task on stop");
			this.stop();
		});

		this.on("newPokemon", (point, pokemons) => {
			console.log(`===== find ${pokemons.length} pokemons in ${point.latitude}, ${point.longitude} =====`);
			console.log(pokemons);
		});

		this.on("accountError", (account, error) => {

		});
	}
}

module.exports = Task;