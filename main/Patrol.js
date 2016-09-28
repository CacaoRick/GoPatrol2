"use strict";
const _ = require("lodash");
const pogobuf = require("pogobuf");
const Promise = require("bluebird");

// this.event.emit("scanComplete", point, pokemons);
// this.event.emit("accountError", account, error);

class Patrol {
	constructor(config, account, event) {
		this.taskStop = false;
		this.config = config;	// 這個 config 已經是 config.general 了
		this.account = account;	// 單一帳號
		this.event = event;
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
			if (this.taskStop) {
				return resolve("task stop");
			}
			if (this.login == null) {
				return reject(Error(`provider 設定錯誤`));
			}
			this.login.login(this.account.username, this.account.password)
				.then(token => {
					// 登入 Client
					this.client.setAuthInfo(this.account.provider, token);
					this.client.setPosition(this.points[0].latitude, this.points[0].longitude);
					return this.client.init();
				})
				.then(() => {
					// 把每一點巡邏跑完
					new Promise.reduce(this.points, (_, point) => {
						return this.scanPoint(point, this.config.requestDelay);
					}, null).then(result => {
						resolve({
							username: this.account.username
						});
					});
				})
				.catch(error => {
					reject(error);
				});
		}).catch(error => {
			console.log(error.message);
			return {
				username: this.account.username,
				error: error.message
			}
		});
	}

	scanPoint(point, delay) {
		return new Promise((resolve, reject) => {
			if (this.taskStop) {
				resolve("task stop");
				return;
			}
			setTimeout(() => {
				if (this.taskStop) {
					resolve("task stop");
					return;
				}
				this.client.setPosition(point.latitude, point.longitude);
				let cellIDs = pogobuf.Utils.getCellIDs(point.latitude, point.longitude);
				this.client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0))
					.then(mapObjects => {
						return mapObjects.map_cells;
					})
					.map(cell => {
						return cell.catchable_pokemons
					})
					.then(pokemons => {
						pokemons = _.uniqBy(_.flatten(pokemons), "encounter_id");
						this.event.emit("scanComplete", point, pokemons);
						resolve("scan complete");
					});
			}, delay);
		}).catch(error => {
			console.log(error.message);
			return error.message;
		});
	}
}

module.exports = Patrol;