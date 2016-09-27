"use strict";
const pogobuf = require("pogobuf");
const Promise = require("bluebird");

// this.task.emit("scannedPoint", point, cell);
// this.task.emit("accountError", account, error);

class Patrol {
	constructor(config, account, task) {
		this.config = config;
		this.account = account;
		this.task = task;
		this.client = new pogobuf.Client();
		this.login = null;
		if (this.account.provider == "ptc") {
			this.login = new pogobuf.PTCLogin();
		}
		if (this.account.provider == "google") {
			this.login = new pogobuf.GoogleLogin();
		}
	}

	setPoints(points) {
		this.points = points;
	}

	run() {
		return new Promise((resolve, reject) => {
			if (this.login != null) {
				this.login.login(this.account.username, this.account.password)
					.catch(error => {
						return `username: ${this.account.username}，provider: ${this.account.provider} 登入失敗，error: ${error.message}`;
					})
					.then(token => {
						this.client.setAuthInfo(this.account.provider, token);
						this.client.setPosition(this.points[0].latitude, this.points[0].longitude);
						return this.client.init();
					})
					.catch(error => {
						return `username: ${this.account.username}，Client.init 失敗，error: ${error.message}`;
					})
					.then(() => {
						// 把每一點巡邏跑完
						new Promise.reduce(this.points, (_, point) => {
							return this.scanPoint(point, this.config.requestDelay);
						}, null).then(result => {
							resolve(this.account.username);
						});
					})
					.catch(error => {
						return `username: ${this.account.username}，error: ${error.message}`;
					});
			} else {
				reject(Error(`username: ${this.account.username}，provider: ${this.account.provider} 設定錯誤`));
			}
		}).catch(error => {
			return error.message;
		});
	}

	scanPoint(point, delay) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				let cellIDs = pogobuf.Utils.getCellIDs(point.latitude, point.longitude);
				return Promise.resolve(this.client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0)))
					.then(mapObjects => {
						console.log("===============", point, "===============");
						return mapObjects.map_cells;
					})
					.each(cell => {
						if (cell.catchable_pokemons.length > 0) {
							//console.log(cell.spawn_points);
							console.log(cell.catchable_pokemons);
						}
						// console.log('Has ' + cell.catchable_pokemons.length + ' catchable Pokemon');
						// return Promise.resolve(cell.catchable_pokemons)
						// 	.each(catchablePokemon => {
						// 		console.log(' - A ' + catchablePokemon.pokemon_id + ' is asking you to catch it.');
						// 	});
						resolve("find" + cell.catchable_pokemons.length);
					});
			}, delay);
		}).catch(error => {
			console.log(error);
			return error;
		});
	}
}

module.exports = Patrol;