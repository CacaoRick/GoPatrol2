"use strict";
const _ = require("lodash");
const Promise = require("bluebird");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");

class Task {
	constructor(location) {
		this.patrols = [];
		this.location = location;
	}

	setAccount(accounts) {
		let patrolPoints = hexGrid.computePatrolPoints(this.location.center, this.location.steps);
		let pointsPerWorker = Math.floor(patrolPoints.length / accounts.length);
		let lastPoints = patrolPoints.length % accounts.length;

		accounts.forEach((account) => {
			let getPoints = pointsPerWorker;
			if (lastPoints > 0) {
				getPoints++;
				lastPoints--;
			}

			let points = _.take(patrolPoints, getPoints);
			patrolPoints = _.drop(patrolPoints, getPoints);

			let patrol = new Patrol(account);
			patrol.setPoints(points);
			this.patrols.push(patrol);
		});
	}

	start() {

	}
	
}

module.exports = Task;