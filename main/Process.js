"use strict";
const _ = require("lodash");
const Promise = require("bluebird");
const Task = require("./Task.js");
let isRunning = false;
let tasks = [];

class Process {
    constructor(event) {
        this.event = event;
    }

    setConfit() {
        this.config = config;
    }

    start() {
        // 分配任務
        config.location.forEach(location => {
            let task = new Task(location, event);
            tasks.push(task);

            // 找出特定任務名稱的帳號
            let accounts = _.filter(config.account, account => {
                return account.task == location.name;
            });

            task.setAccount(accounts);
            task.start();
        });
    }
}