"use strict";
$(() => {
	// 註冊設定頁面三個按鈕
	$("button#save").click(saveConfig);
	$("button#reload").click(loadConfig);
	$("button#reset").click(resetConfig);

	// 建立 151 隻 Pokemon 的選項清單
	createPokemonTbody();

	// 讀設定檔
	loadConfig();

	// 處理 inform 狀態
	$("input.inform").each((index, element) => {
		updateInform($(element).attr("id"));
	});
	// 處理 sticker 狀態
	$("input.sticker").change((index, element) => {
		updateSticker($(element).attr("id"));
	});
	// 處理 status 狀態
	$("input.status").change((index, element) => {
		updateStatus($(element).attr("id"));
	});

	// requestDelay 檢查，小於 5000 改 5000
	$("input#requestDelay").focusout(event => {
		checkRequestDelay();
	});

	// ivFilter 檢查，小於 0 改 0，大於 100 改 100
	$("input.ivFilter").focusout(event => {
		checkIvFilter($(event.target).attr("id"));
	});

	// 加入新管理員 By Enter
	$("input#admin-input").keypress(evente => {
		if (event.which == 13) {
			addAdmin();
		}
	});

	// 加入新管理員 By Button
	$("button#add-admin").click(() => {
		addAdmin();
	});

	// 加入新頻道 By Enter
	$("input#channel-input").keypress(event => {
		if (event.which == 13) {
			addChannel();
		}
	});

	// 加入新頻道 By Button
	$("button#add-channel").click(() => {
		addChannel();
	});

	// 處理顯示距離相關的其他選項 disabled 狀態
	$("input#showDistance").change(() => {
		updateShowDistance();
	});

	// 處理允許接收指令相關的管理員選項 disabled 狀態
	$("input#enableCommand").change(() => {
		updateEnableCommand();
	});

	// 註冊 Pokemon List 批次按鈕的 click 事件
	$("button#inform-select-all").click(informSelectAll);
	$("button#inform-clean-all").click(informCleanAll);
	$("button#sticker-select-all").click(stickerSelectAll);
	$("button#sticker-clean-all").click(stickerCleanAll);
	$("button#status-select-all").click(statusSelectAll);
	$("button#status-clean-all").click(statusCleanAll);

	// 處理 Pokemon list 的通知開關
	$("input.inform").change(event => {
		// 處理 inform 狀態
		updateInform($(event.target).attr("id"));
	});

	// 處理 Pokemon list 的貼圖開關
	$("input.sticker").change(event => {
		// 處理 sticker 狀態
		updateSticker($(event.target).attr("id"));
	});

	// 處理 Pokemon list 的查IV開關
	$("input.status").change(event => {
		// 處理 status 狀態
		updateStatus($(event.target).attr("id"));
	});
});

// 新增管理員
function addAdmin() {
	// 取出要新增的管理員使用者名稱
	let admin = $("input#admin-input").val();
	// 判斷是否為空字串
	if (admin != "") {
		// 根據 Telegram 的規則確認格式是否正確
		if (regexp.test(admin)) {
			// 格式正確，移除錯誤狀態
			$("input#admin-input").parent().parent().removeClass("has-error");
			// 確認是否已新增過
			if (admins.indexOf(admin) < 0) {
				// 沒新增過，將 html input 框框中的字刪除
				$("input#admin-input").val("");
				// 確認無誤，加入管理員
				pushAdmin(admin)
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			$("input#admin-input").parent().parent().addClass("has-error");
		}
	}
}

// 確認無誤，加入管理員
function pushAdmin(admin) {
	// 將 admin 新增進 admins
	admins.push(admin);
	// 讓 html 顯示出新增的 admin
	$("#admins").append(
		"<span username=" + admin + " class='tag label label-info'><span>" + admin + " "
		+ "</span><span onclick='removeAdmin(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
	);
}

// 刪除管理員
function removeAdmin(span) {
	// 找出目前要刪除的管理員在 admins 中的 index
	let index = admins.indexOf($(span).parent().attr("username"));
	// 從 admins 中刪除
	admins.splice(index, 1);
	// 從 html 畫面中刪除
	$(span).parent().remove();
}

// 新增頻道
function addChannel() {
	// 取出要新增的頻道ID
	let channel = $("input#channel-input").val();
	// 判斷是否為空字串
	if (channel != "") {
		// 根據 Telegram 的規則確認格式是否正確
		if (regexp.test(channel)) {
			// 格式正確，移除錯誤狀態
			$("input#admin-input").parent().parent().removeClass("has-error");
			// 確認是否已新增過
			if (channels.indexOf(channel) < 0) {
				// 沒新增過，將 html input 框框中的字刪除
				$("input#channel-input").val("");
				// 確認無誤，新增頻道
				pushChannel(channel);
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			$("input#admin-input").parent().parent().addClass("has-error");
		}
	}
}

// 確認無誤，新增頻道
function pushChannel(channel) {
	// 將 channel 新增進 channels
	channels.push(channel);
	// 讓 html 顯示出新增的 channel
	$("#channels").append(
		"<span channelId=" + channel + " class='tag label label-info'><span>" + channel + " "
		+ "</span><span onclick='removeChannel(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
	);
}

// 刪除頻道
function removeChannel(span) {
	// 找出目前要刪除的頻道在 channels 中的 index
	let index = channels.indexOf($(span).parent().attr("channelId"));
	// 從 channels 中刪除
	channels.splice(index, 1);
	// 從 html 畫面中刪除
	$(span).parent().remove();
}

// 處理顯示距離相關的其他選項 disabled 狀態
function updateShowDistance() {
	if ($("input#showDistance").is(":checked")) {
		$("button.showDistanceSubOption").removeClass("disabled");
		$("input.showDistanceSubOption").prop("disabled", false);
	} else {
		$("button.showDistanceSubOption").addClass("disabled");
		$("input.showDistanceSubOption").prop("disabled", true);
	}
}

function checkRequestDelay() {
	if ($("input#requestDelay").val() < 5000) {
		$("input#requestDelay").val(5000);
	}
}

function checkIvFilter(id) {
	if ($(`input#${id}.ivFilter`).val() < 0) {
			$(`input#${id}.ivFilter`).val(0);
		}
	if ($(`input#${id}.ivFilter`).val() > 100) {
		$(`input#${id}.ivFilter`).val(100);
	}
}

// inform 全選
function informSelectAll() {
	$("input.inform").prop("checked", true);
	$("input.inform").each((index, element) => {
		updateInform($(element).attr("id"));
	});
}

// inform 清除
function informCleanAll() {
	$("input.inform").prop("checked", false);
	$("input.inform").each((index, element) => {
		updateInform($(element).attr("id"));
	});	
}

// sticker 全選
function stickerSelectAll() {
	$("input.sticker").prop("checked", true);
	$("input.sticker").each((index, element) => {
		updateSticker($(element).attr("id"));
	});	
}

// sticker 清除
function stickerCleanAll() {
	$("input.sticker").prop("checked", false);
	$("input.sticker").each((index, element) => {
		updateSticker($(element).attr("id"));
	});	
}

// Status 全選
function statusSelectAll() {
	$("input.status").prop("checked", true);
	$("input.status").each((index, element) => {
		updateStatus($(element).attr("id"));	
	});
}

// Status 清除
function statusCleanAll() {
	$("input.status").prop("checked", false);
	$("input.status").each((index, element) => {
		updateStatus($(element).attr("id"));	
	});
}

// 處理允許接收指令相關的管理員選項 disabled 狀態
function updateEnableCommand() {
	if ($("input#enableCommand").is(":checked")) {
		$("button.enableCommandSubOption").removeClass("disabled");
		$("input#admin-input").prop("disabled", false);
	} else {
		$("button.enableCommandSubOption").addClass("disabled");
		$("input#admin-input").prop("disabled", true);
	}
}

// 根據 inform 狀態來更新其他選項的 disabled 狀態
function updateInform(id) {
	// 檢查 inform 是否有勾
	if ($(`input#${id}.inform`).is(":checked")) {
		// 有勾，顯示顏色按鈕
		$(`input#${id}.inform`).parent().addClass("btn-primary");
		// 更改子選項的可用狀態
		// enable input
		$(`input#${id}.informSubOption`).prop("disabled", false);
		// enable lable
		$(`input#${id}.informSubOption`).parent().removeClass("disabled");
	} else {
		// 沒勾，拿掉顏色按鈕
		$(`input.inform#${id}`).parent().removeClass("btn-primary");
		// 更改子選項的可用狀態
		// disable input
		$(`input#${id}.informSubOption`).prop("disabled", true);
		// disable lable
		$(`input#${id}.informSubOption`).parent().addClass("disabled");
	}
	// 根據 status 狀態來更新 ivFilter 的 disabled 狀態
	updateStatus(id);
}

// 根據 sticker 狀態來更新
function updateSticker(id) {
	if ($(`input#${id}.sticker`).is(":checked")) {
		// 有勾，顯示顏色按鈕
		$(`input#${id}.sticker`).parent().addClass("btn-info");
	} else {
		// 沒勾，拿掉顏色按鈕
		$(`input#${id}.sticker`).parent().removeClass("btn-info");
	}
}

// 根據 status 狀態來更新 ivFilter 的 disabled 狀態
function updateStatus(id) {
	if ($(`input#${id}.status`).is(":checked")) {
		// 有勾，顯示顏色按鈕
		$(`input#${id}.status`).parent().addClass("btn-warning");
		if ($(`input#${id}.inform`).is(":checked")) {
			// inform 也有勾，允許 ivFilter
			$(`input#${id}.ivFilter`).prop("disabled", false);
		}
	} else {
		// 沒勾，拿掉顏色按鈕
		$(`input#${id}.status`).parent().removeClass("btn-warning");
		// 禁止 ivFilter
		$(`input#${id}.ivFilter`).prop("disabled", true);
	}
}

// 建立 151 隻 Pokemon 的選項清單
function createPokemonTbody() {
	for (var i = 1; i <= 151; i++) {
		let id = `<p><h4>#${i}</h4></p>`;
		let name = `<p>name</p>`;
		let img = `<p><img src="assets/pokemon-3d/${i}.png" style="width: 96px; height: 96px; object-fit: contain;"></p>`;
		let inform = `<p><label class="btn btn-default" style="width: 120px"><input id="${i}" class="inform hidden" type="checkbox" data-toggle="buttons" onclick="this.blur();">傳送通知</label></p>`;
		let sticker = `<p><label class="btn btn-default" style="width: 120px"><input id="${i}" class="sticker hidden informSubOption" type="checkbox" data-toggle="buttons" onclick="this.blur();">傳送帖圖</label></p>`;
		let status = `<p><label class="btn btn-default" style="width: 120px"><input id="${i}" class="status hidden informSubOption" type="checkbox" data-toggle="buttons" onclick="this.blur();">查詢IV與招式</label></p>`;
		let ivFilter = `<form class="form-inline"><p><div class="form-group"><label class="control-label">IV篩選≧</label><input id="${i}" class="ivFilter form-control text-center" type="number" onClick="this.select();" min="0" max="100" value="0"></div></p></form>`;
		$("#pokemonList").append(`<div #="${i}" class="panel panel-default col-md-4"><div class="col-md-5 text-center">${id}${name}${img}</div><div class="col-md-7 text-center"><br>${inform}${sticker}${status}${ivFilter}</div></div>`);	
	}
}

// 儲存設定檔
function saveConfig() {
	configGeneral.googleMapsAPIKey = $("input#googleMapsAPIKey").val();
	configGeneral.telegramBotToken = $("input#telegramBotToken").val();
	configGeneral.sendVenue = $("input#sendVenue").is("checked");
	configGeneral.showDistance = $("input#showDistance").is("checked");
	configGeneral.useDistanceLocation = $("input#useDistanceLocation").is("checked");
	configGeneral.distanceLocation.latitude = $("input#distanceLocation-latitude").val();
	configGeneral.distanceLocation.longitude = $("input#distanceLocation-longitude").val();
	configGeneral.enableCommand = $("input#enableCommand").is("checked");
	configGeneral.admins = admins;
	configGeneral.channels = channels;
	checkRequestDelay();
	configGeneral.requestDelay = $("input#requestDelay").val();
	configGeneral.pokemonNameId = $(`input[name="pokemonNameId"]:checked`).val(); 
	configGeneral.pokemonList = [];
	for (let id = 1; id <= 151; id++) {
		checkIvFilter(id);
		configGeneral.pokemonList.push({
			id: id,
			inform: $(`input#${id}.inform`).is("checked"),
			sticker: $(`input#${id}.sticker`).is("checked"),
			status: $(`input#${id}.status`).is("checked"),
			ivFilter: $(`input#${id}.ivFilter`).val() 
		});
	}

	let json = JSON.stringify(configGeneral, null, "\t");
	fs.writeFile("./config-general.json", json, { flag : "w" }, (err) => {
		if (err == null) {
			console.log("儲存成功");
		} else {
			console.log(err);
		}
	});
}

// 讀取設定檔
function loadConfig() {
	try {
		// 讀取 json 設定檔
		configGeneral = require("../config-general.json");
	} catch(e) {
		// 讀取失敗，讀預設檔
		configGeneral = require("./default-general.js");
	}
	parseConfig();
}

// 讀取預設值
function resetConfig() {
	configGeneral = require("./default-general.js");
	parseConfig();
}

// 將 config 檔的設定載入本頁面中
function parseConfig() {
	$("input#googleMapsAPIKey").val(configGeneral.googleMapsAPIKey);
	$("input#telegramBotToken").val(configGeneral.telegramBotToken);
	$("input#sendVenue").prop("checked", configGeneral.sendVenue);
	$("input#showDistance").prop("checked", configGeneral.showDistance);
	updateShowDistance();
	$("input#useDistanceLocation").prop("checked", configGeneral.useDistanceLocation);
	$("input#distanceLocation-latitude").val(configGeneral.distanceLocation.latitude);
	$("input#distanceLocation-longitude").val(configGeneral.distanceLocation.longitude);
	$("input#enableCommand").prop("checked", configGeneral.enableCommand);
	updateEnableCommand();
	admins = [];
	configGeneral.admins.forEach((admin, index) => {
		if (admin != "" && regexp.test(admin) && admins.indexOf(admin) < 0) {
			// 檢查通過，新增
			pushAdmin(admin);
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			console.log(`config-general: Telegram 管理員 [${index}] = "${admin}" 格式錯誤或重複`);
		}
	});
	channels = [];
	configGeneral.channels.forEach((channel, index) => {
		if (channel != "" && regexp.test(channel) && admins.indexOf(channel) < 0) {
			// 檢查通過，新增
			pushChannel(channel);
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			console.log(`config-general: Telegram 頻道 [${index}] = "${channel}" 格式錯誤或重複`);
		}
	});
	$("input#requestDelay").val(configGeneral.requestDelay);
	checkRequestDelay();
	$(`input#pokemonNameId${configGeneral.pokemonNameId}`).prop("checked", true);
	if (configGeneral.pokemonList !== undefined && configGeneral.pokemonList.length != 0) {
		configGeneral.pokemonList.forEach(pokemon => {
			$(`input#${pokemon.id}.inform`).prop("checked", pokemon.inform);
			$(`input#${pokemon.id}.sticker`).prop("checked", pokemon.sticker);
			$(`input#${pokemon.id}.status`).prop("checked", pokemon.status);
			$(`input#${pokemon.id}.ivFilter`).val(pokemon.ivFilter);
			checkIvFilter(pokemon.id);
			updateInform(pokemon.id);
			updateSticker(pokemon.id);
			updateStatus(pokemon.id);
		});
	}
}