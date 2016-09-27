"use strict";
const TelegramBot = require("node-telegram-bot-api-latest");

class Telegram {
	constructor(config, event) {
		this.bot = TelegramBot(config.general.telegramBotToken, { polling: false });
		this.config = config;
		this.event = event;
		this.messageTarget = config.general.channels;
		this.logTarget = [];
		this.messageQueue = [];
		bindEvent();
		bindBotEvent();
	}

	bindEvent() {
		this.event.on("sendPokemon", pokemon => {

		})
	}

	bindBotEvent() {
		this.bot.on("message", msg => {

		});
	}
}

