"use strict";
const TelegramBot = require("node-telegram-bot-api-latest");
const bot = TelegramBot(configGeneral.telegramBotToken, { polling: false });
let messageTarget = [];
let logTarget = [];
let messageQueue = [];

function setup() {
	messageTarget = _.union(messageTarget, configGeneral.channels);
}

function testBot() {

}

bot.on("message", msg => {

});