"use strict";
const _ = require("lodash");
const EventEmitter = require("events");
const Promise = require("bluebird");
const Task = require("./Task.js");


class GoPatrol {
    constructor() {
        super();
        this.event = new EventEmitter();
        this.isRunning = false;
        this.tasks = [];
    }

    setConfig() {
        this.config = config;
    }

    start() {
        // 分配任務
        config.location.forEach(location => {
            let task = new Task(location, this.event);
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
        this.event.on("config", () => {
            gopatrol.setConfig(config);
        });

        this.event.on("start", () => {
            gopatrol.start();
        });

        this.event.on("stop", () => {
            gopatrol.stop();
        });

        this.event.on("newPokemon", pokemon => {
            console.log(pokemon);
        });
    }
}

module.exports = GoPatrol;