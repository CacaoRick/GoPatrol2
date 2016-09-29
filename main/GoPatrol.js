"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const moment = require("moment");
const Database = require("../util/Database.js");
const pokemonNames = require("../util/pokemon-names.js");
const pokemonMoves = require("../util/pokemon-moves.js");
const Task = require("./Task.js");

class GoPatrol {
	constructor() {
		this.event = new EventEmitter();
		this.isRunning = false;
		this.tasks = [];
	}

	setConfig(config) {
		this.config = config;
		this.mapPokemonNames();
		this.database = new Database();
		this.stop();
		this.deleteTask();
		this.assignTask();
	}

	mapPokemonNames() {
		let keys = ["zh", "tw", "hk", "jp", "en"];
		this.pokemonNames = _.map(pokemonNames, keys[this.config.general.pokemonNameId]);
	}

	assignTask() {
		this.config.location.forEach(location => {
			let task = new Task(this.config, this.event);
			this.tasks.push(task);

			// 找出特定任務名稱的帳號
			let accounts = _.filter(this.config.account, account => {
				return account.task == location.name;
			});

			// 設定 task
			task.assignTask(location, accounts);
		});
		this.bindEvent()
	}

	deleteTask() {
		this.event.removeAllListeners();
		this.tasks.forEach(task => {
			task = null;
		})
		this.tasks = [];
	}

	start() {
		if (!this.isRunning) {
			this.isRunning = true;
			console.log("gopatrol emit start");
			this.event.emit("start");
		} else {
			console.log("gopatrol emit start but is running");
		}
	}

	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			console.log("gopatrol emit stop");
			this.event.emit("stop");
		}
	}

	bindEvent() {
		this.event.on("scanComplete", (point, pokemons) => {
			console.log(`- ${moment()}: find ${pokemons.length} pokemons in ${point.latitude}, ${point.longitude}`);
			this.database.insertScannedLocation(point, moment() + moment({ minute: 10 }));

			pokemons.forEach(pokemon => {
				console.log(pokemon);

				this.database.insertPokemon(pokemon)
					.spread((pokemon, created) => {
						if (created) {
							console.log(`新增 #${pokemon.dataValues.pokemon_id} ${this.pokemonNames[pokemon.dataValues.pokemon_id]} 結束於 ${pokemon.dataValues.disappear_time}`);
						}
					});
			});
		});

		this.event.on("accountError", (account, error) => {
			console.log(account, error);
		});
	}
}

module.exports = GoPatrol;