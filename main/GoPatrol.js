"use strict";
const _ = require("lodash");
const moment = require("moment");
const EventEmitter = require("events");
const Task = require("./Task.js");
const Patrol = require("./Patrol.js");
const hexGrid = require("../util/hex-grid.js");
const Database = require("../util/Database.js");
const pokemonNames = require("../util/pokemon-names.js");
const pokemonMoves = require("../util/pokemon-moves.js");

class GoPatrol {
	constructor() {
		this.config = null;
		this.pokemonNames = null;
		this.encounterList = null;
		this.event = new EventEmitter();
		this.database = new Database();
		this.isRunning = false;
		this.tasks = [];
		this.patrols = [];

		this.bindEvent();
	}

	bindEvent() {
		this.event.on("scanComplete", (point, pokemons) => {
			console.log(`- ${moment()}: find ${pokemons.length} pokemons in ${point.latitude}, ${point.longitude}`);
			this.database.insertScannedLocation(point, moment().add(15, "m").format("x"));
			pokemons.forEach(pokemon => {
				this.database.insertPokemon(pokemon)
					.then(pokemon => {
						if (pokemon != null) {
							console.log(`新增 #${pokemon.dataValues.pokemon_id} ${this.pokemonNames[pokemon.dataValues.pokemon_id]} 結束於 ${pokemon.dataValues.disappear_time}`);
						}
					});
			});
		});

		this.event.on("accountError", (account, error) => {
			console.log(account, error);
		});
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			console.log("emit start");
			this.event.emit("start");
		} else {
			console.log("emit start but is running");
		}
	}

	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			console.log("emit stop");
			this.event.emit("stop");
		}
	}

	restart() {
		if (this.isRunning) {
			this.event.emit("stop");
			setTimeout(() => {
				this.event.emit("start");
			}, this.config.general.requestDelay)
		}
	}

	setConfig(config) {
		let isRestart = this.isRunning;
		this.stop();
		this.config = config;
		this.config.general.switchModeTime = 60;	// 暫時放這裡，之後要寫到 UI 去
		this.mapPokemonNames();
		this.mapEncounterPokemons();
		this.createPatrol();
		this.createTask();
		if (isRestart) {
			// 經過 requestDelay 後再開始
			setTimeout(this.start(), this.config.general.requestDelay);
		}
	}

	mapPokemonNames() {
		let keys = _.keys(pokemonNames[1]);
		this.pokemonNames = _.map(pokemonNames, keys[this.config.general.pokemonNameId]);
	}

	mapEncounterPokemons() {
		let encounterPokemons = _.filter(this.config.general.pokemonList, pokemon => {
			return pokemon.status;
		})
		this.encounterList = _.map(encounterPokemons, "id");
	}

	createPatrol() {
		// 清空 patrols
		this.patrols = [];
		// 幫每個帳號建立 Patrol
		this.config.accounts.forEach(account => {
			let patrol = new Patrol(this.event, this.database, account, this.encounterList, this.config.general.requestDelay);
			this.patrols.push(patrol);
		});
	}

	createTask() {
		// 分配數量
		let patrolForTasks = this.assignPatrols(this.patrols);
		
		// 清空 tsasks
		this.tasks = [];
		this.config.locations.forEach((location, index) => {
			// 建立新的 task
			let task = new Task(this.event, this.database,patrolForTasks[index],
				{ center: location.center, steps: location.steps },
				{ switchModeTime: this.config.general.switchModeTime, requestDelay: this.config.general.requestDelay });
			this.tasks.push(task);
		})
	}

	// 分配各 task 的 patrol
	assignPatrols(patrols) {
		let totalPoints = _.reduce(this.config.locations, (sum, location) => {
			return sum + (((location.steps * (location.steps - 1)) * 3) + 1);
		}, 0);
		let lastPatrols = patrols.length;

		// 先分配一次數量
		let assignAmounts = _.map(this.config.locations, location => {
			let patrolAmount = Math.floor(patrols.length * ((((location.steps * (location.steps - 1)) * 3) + 1) / totalPoints));
			patrolAmount = patrolAmount == 0 ? 1 : patrolAmount;
			lastPatrols -= patrolAmount;
			return patrolAmount;
		});

		// 把剩下的數量分掉
		for (let i = 0; i < lastPatrols; i++) {
			assignAmounts[i]++;
		}

		// 分配 Patrol
		let patrolForTasks = [];
		assignAmounts.forEach((amount, index) => {
			patrolForTasks[index] = _.take(patrols, amount);
			patrols = _.drop(patrols, amount);
		});

		return patrolForTasks;
	}

	isSpawnPointChecked(spawnpoints) {
		let isSpawnPointChecked = true;
		spawnpoints.forEach(spawnpoint => {
			if (spawnpoint.type.indexOf("-") > -1) {
				return false;
			}
		});
		return isSpawnPointChecked;
	}
}

module.exports = GoPatrol;