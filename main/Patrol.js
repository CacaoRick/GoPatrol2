"use strict";
const pogobuf = require("pogobuf");
const Promise = require("bluebird");

class Patrol {
	constructor(account) {
		this.account = account;
	}

	setPoints(points) {
		this.points = points;
	}

	start() {
		
	}
}

module.exports = Patrol;