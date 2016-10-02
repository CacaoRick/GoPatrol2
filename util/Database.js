"use strict";
const _ = require('lodash');
const Sequelize = require('sequelize');

/**
 * Sequelize 文件：http://docs.sequelizejs.com/en/v3/
 * where 範例
 * Project.findAll({
 *		where: {
 *			id: {
 *				$and: {a: 5}           // AND (a = 5)
 *				$or: [{a: 5}, {a: 6}]  // (a = 5 OR a = 6)
 *				$gt: 6,                // id > 6
 *				$gte: 6,               // id >= 6
 *				$lt: 10,               // id < 10
 *				$lte: 10,              // id <= 10
 *				$ne: 20,               // id != 20
 *				$between: [6, 10],     // BETWEEN 6 AND 10
 *				$notBetween: [11, 15], // NOT BETWEEN 11 AND 15
 *				$in: [1, 2],           // IN [1, 2]
 *				$notIn: [1, 2],        // NOT IN [1, 2]
 *				$like: '%hat',         // LIKE '%hat'
 *				$notLike: '%hat'       // NOT LIKE '%hat'
 *				$iLike: '%hat'         // ILIKE '%hat' (case insensitive)  (PG only)
 *				$notILike: '%hat'      // NOT ILIKE '%hat'  (PG only)
 *				$overlap: [1, 2]       // && [1, 2] (PG array overlap operator)
 *				$contains: [1, 2]      // @> [1, 2] (PG array contains operator)
 *				$contained: [1, 2]     // <@ [1, 2] (PG array contained by operator)
 *				$any: [2,3]            // ANY ARRAY[2, 3]::INTEGER (PG only)
 *			},
 *			status: {
 *				$not: false,           // status NOT FALSE
 *			}
 *		}
 * })
 */

class Database {
	/**
	 * @param  {} options 可傳入 dialect, host, port 等設定，或是留空使用 sqlite
	 */
	constructor(username = null, password = null, options = {}) {
		options = _.defaults(options, {
			//logging: false,
			dialect: "sqlite",
			host: "localhost",
			pool: {
				max: 5,
				min: 0,
				idle: 10000
			},

			// SQLite only
			storage: "./database.sqlite"
		});

		this.sequelize = new Sequelize("gopatrol", username, password, options);

		this.ScannedLocation = this.sequelize.define("scannedlocation", {
			latitude: { type: Sequelize.FLOAT },
			longitude: { type: Sequelize.FLOAT },
			disappear_time: { type: Sequelize.STRING }
		}, {
				timestamps: false,
				freezeTableName: true,
				tableName: "scannedlocation"
			}
		);

		this.SpawnPoint = this.sequelize.define("spawnpoint", {
			spawnpoint_id: {
				type: Sequelize.STRING,
				primaryKey: true
			},
			spawn_type: { type: Sequelize.STRING, defaultValue: "---1" },	// -: 尚無資料｜0: 不出現｜1: 出現｜2: 出現，但結束時間不明
			latitude: { type: Sequelize.FLOAT },
			longitude: { type: Sequelize.FLOAT },
			disappear_seconds: { type: Sequelize.STRING }
		}, {
				timestamps: false,
				freezeTableName: true,
				tableName: "spawnpoint"
			}
		);

		this.Pokemon = this.sequelize.define("pokemon", {
			encounter_id: {
				type: Sequelize.STRING,
				primaryKey: true
			},
			spawnpoint_id: { type: Sequelize.STRING },
			pokemon_id: { type: Sequelize.INTEGER },
			latitude: { type: Sequelize.FLOAT },
			longitude: { type: Sequelize.FLOAT },
			individual_attack: { type: Sequelize.INTEGER },
			individual_defense: { type: Sequelize.INTEGER },
			individual_stamina: { type: Sequelize.INTEGER },
			move_1: { type: Sequelize.INTEGER },
			move_2: { type: Sequelize.INTEGER },
			disappear_time: { type: Sequelize.STRING }
		}, {
				timestamps: false,
				freezeTableName: true,
				tableName: "pokemon"
			}
		);

		this.sequelize.sync()
			.catch(error => {
				console.log(error);
			});
	}

	// =============== SpawnPoint ===============

	processSpawnPoint(pokemon) {

	}

	isSpawnPointExists(spawnpoint_id) {
		this.Spawnpoint
			.findAll({
				attributes: [[this.sequelize.fn('COUNT', this.sequelize.col('spawnpoint_id')), 'count']],
				where: { spawnpoint_id: { $eq: spawnpoint_id } }
			}).then(data => {
				return data.dataValues.count > 0;
			})
	}

	insertSpawnPoint(spawnpoint) {
		return this.SpawnPoint
			.create(spawnpoint);
	}

	updateSpawnPoint(modify, where) {
		return this.SpawnPoint
			.update(modify, where);
	}

	// =============== Pokemon ===============

	isNeedEncounter(pokemon) {
		return this.Pokemon
			.count({
				where: {
					encounter_id: { $eq: pokemon.encounter_id },
					individual_attack: { $ne: null }
				}
			})
			.then(count => {
				if (count == 0) {
					return true;
				} else {
					return false;
				}
			})
	}

	insertPokemon(pokemon) {
		return this.Pokemon
			.count({
				where: {
					encounter_id: { $eq: pokemon.encounter_id },
					disappear_time: { $eq: pokemon.disappear_time }
				}
			})
			.then(count => {
				if (count == 0) {
					return this.Pokemon.create(pokemon);
				} else {
					return null;
				}
			});
	}

	cleanTimeoutPokemon() {
		return this.Pokemon
			.destroy({
				where: {
					disappear_time: {
						$lte: Date.now()
					}
				}
			});
	}

	getAllPokemon() {
		return cleanPokemon()
			.then(() => {
				return this.Pokemon.findAll();
			});
	}

	// =============== ScannedLocation ===============

	insertScannedLocation(location, disappear_time) {
		return this.ScannedLocation
			.count({
				where: {
					latitude: { $eq: location.latitude },
					longitude: { $eq: location.longitude }
				}
			})
			.then(count => {
				if (count == 0) {
					return this.ScannedLocation.create({
						latitude: location.latitude,
						longitude: location.longitude,
						disappear_time: disappear_time
					});
				} else {
					return this.ScannedLocation.update({ disappear_time: disappear_time }, {
						where: {
							latitude: { $eq: location.latitude },
							longitude: { $eq: location.longitude }
						}
					});
				}
			});
	}

	cleanTimeoutScannedLocation() {
		return this.ScannedLocation
			.destroy({
				where: {
					disappear_time: {
						$lte: Date.now()
					}
				}
			});
	}
}

module.exports = Database;