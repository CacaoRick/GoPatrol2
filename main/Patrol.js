"use strict";
const pogobuf = require("pogobuf");
const Promise = require("bluebird");

class Patrol {
	constructor(account, event) {
		this.account = account;
		this.event = event;
	}

	setPoints(points) {
		this.points = points;
	}

	start() {
		this.event.emit("pokemon", "test");
	}
}

module.exports = Patrol;