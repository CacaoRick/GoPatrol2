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
				patrol.setTask(this);
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

	// 處理成 {spawnpointId, latitude, longitude, type, disappearTime}，並存入資料庫中
	processSpawnPoints(pokemons) {
		pokemons.forEach(pokemon => {
			// 找出原有的 spawnPoint
			let spawnPoint = _.find(this.spawnPoints, {spawnpoint_id: pokemon.spawnpoint_id});
			if (spawnPoint) {
				if (pokemon.disappear_time < 0) {
					pokemon.disappear_seconds = getDisappearSeconds(pokemon.disappear_time);
					pokemon.disappear_time = moment();
					if (_.split(spawnPoint.type, "")[3] == 2) {
						// spawnPoint 原本的時間異常
						if (spawnPoint.disappear_seconds - pokemon.disappear_seconds > 0) {

						}
						// 			if 舊的時間.isAfter的時間
						// 				計算新的時間是在第幾個15分鐘
						// 				更新type
						// 			else
						// 				將舊的type 和時間（可能有多個）轉換為時間陣列
						// 				計算以新時間為第四格時，舊時間們是在第幾個15分鐘
						// 				更新type和disappear_minutes
					} else {
						// spawnPoint 原本的時間正常
						
						// 			計算新的時間在第幾個15分鐘
						// 			更新type
					}
					
				} else {
					// 		if 舊的時間異常
					// 			將舊的type 和時間（可能有多個）轉換為時間陣列
					// 			計算以新時間為第四格時，舊時間們在第幾個15分鐘
					// 			更新type和disappear_minutes
					// 		else
					// 			取大值更新disappear_minutes
					// 			Database.updateSpawnPoint()
				}
			} else {
				// 	if 時間異常
				// 		建立一個spawn point type=---2
				// 	else
				// 		建立一個spawn point type=---1
				// 		Database.insertSpawnPoint()
			}

			
			

			let isSpecial = false;
			if (disappear_time < 0) {
				// 特殊時間，設為現在
				disappear_time = moment();
				isSpecial = true;
			}
			let disappear_seconds = moment.duration(pokemon.disappear_time.get("minutes") * 60 + pokemon.disappear_time.get("seconds"), "seconds");
			
			if (spawnPoint) {
				// 有找到，判斷需不需要更新
				
			} else {
				let spawn_type = isSpecial ? "---2" : "---1";
				// 沒找到，新增
				spawnPoint = {
					spawnpoint_id: pokemon.spawnpoint_id,
					spawn_type: spawn_type,
					latitude: pokemon.latitude,
					longitude: pokemon.longitude,
					disappear_seconds: disappear_seconds.as("seconds")
				}
			}
		});
	}
}

module.exports = Task;

function getDisappearSeconds(disappear_time) {
	if (!moment.isMoment(disappear_time)) {
		disappear_time = moment(disappear_time);
	}

	let disappear_seconds = moment.duration(disappear_time.get("minutes") * 60 + disappear_time.get("seconds"), "seconds");
	return disappear_seconds.as("seconds");
}