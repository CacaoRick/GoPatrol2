"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Promise = require("bluebird");
const Task = require("./Task.js");
let isRunning = false;
let tasks = [];

class GoPatrol extends EventEmitter {
    constructor() {
        super();
    }

    setConfit() {
        this.config = config;
    }

    start() {
        // 分配任務
        config.location.forEach(location => {
            let task = new Task(location, this);
            tasks.push(task);

            // 找出特定任務名稱的帳號
            let accounts = _.filter(config.account, account => {
                return account.task == location.name;
            });

            task.setAccount(accounts);
            task.start();
        });
    }

    bindEvent() {
        this.on("config", () => {
            gopatrol.setConfig(config);
        });

        this.on("start", () => {
            gopatrol.start();
        });

        this.on("stop", () => {
            gopatrol.stop();
        });

        this.on("newPokemon", pokemon => {
            console.log(pokemon);
        });
    }
}

module.exports = GoPatrol;