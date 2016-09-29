"use strict";
const _ = require("lodash");
const pogobuf = require("pogobuf");
const Promise = require("bluebird");

class Patrol {
	constructor(requestDelay, encounterList, account, event) {
		this.taskStop = false;
		this.requestDelay = requestDelay;
		this.encounterList = encounterList;
		this.account = account;
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
						return this.scanPoint(point, this.requestDelay);
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
				// 更改 client 位置
				this.client.setPosition(point.latitude, point.longitude);
				// 取得目前位置的 cellIDs
				let cellIDs = pogobuf.Utils.getCellIDs(point.latitude, point.longitude);
				// 根據 cellIDs 取得 mapObjects
				this.client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0))
					.then(mapObjects => {
						// 取出 map_cells
						return mapObjects.map_cells;
					})
					.map(cell => {
						// 取出每個 cell 的 catchable_pokemons
						return cell.catchable_pokemons
					})
					.then(pokemons => {
						// 用 encounter_id 篩選出不重複的 pokemons
						pokemons = _.uniqBy(_.flatten(pokemons), "encounter_id");

						// 更改 key 名稱 expiration_timestamp_ms -> disappear_time
						pokemons.forEach(pokemon => {
							pokemon.disappear_time = pokemon.expiration_timestamp_ms;
							delete pokemon.expiration_timestamp_ms;
						});

						// 依序去跑每隻 pokemon
						new Promise.reduce(pokemons, (_, pokemon) => {
							// 判斷是否要查 IV 和技能
							if (this.encounterList.indexOf(pokemon.pokemon_id) != -1) {
								// 遭遇 pokemon 取得 IV 和 Moves
								return this.encounterPokemon(pokemon, this.requestDelay);
							} else {
								return pokemon;
							}
						}, null)
							.then(() => {
								// 全部結束，將 pokemons 丟給 GoPatrol
								this.event.emit("scanComplete", point, pokemons);
								resolve("scan complete");
							})
					});
			}, delay);
		}).catch(error => {
			console.log(error.message);
			return error.message;
		});
	}

	encounterPokemon(pokemon, requestDelay) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.client.encounter(pokemon.encounter_id, pokemon.spawn_point_id)
					.then(result => {
						if (result.wild_pokemon != null) {
							let data = result.wild_pokemon.pokemon_data;
							pokemon.individual_attack = data.individual_attack;
							pokemon.individual_defense = data.individual_defense;
							pokemon.individual_stamina = data.individual_stamina;
							pokemon.move_1 = data.move_1;
							pokemon.move_2 = data.move_2;
						}
						resolve(pokemon);
					});
			}, requestDelay);
		});
	}
}

module.exports = Patrol;