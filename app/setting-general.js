let admins = [];
let channels = [];
let regexp = /^[a-zA-Z@][a-zA-Z0-9_]{3,29}[a-zA-Z0-9]$/;
$(() => {

	// 建立 151 隻 Pokemon 的選項清單
	createPokemonTbody();

	// messageDelay 檢查，小於 0 會改 0
	$("input#messageDelay").focusout(event => {
		if ($(event.target).val() < 0) {
			$(event.target).val(0);
		}
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
		showDistanceChange();
	});

	// 處理 Pokemon list 的通知開關
	$("input.inform.hidden").change(event => {
		// 處理 inform 狀態
		informChange(event.target);
	});

	// 處理 Pokemon list 的貼圖開關
	$("input.sticker.hidden").change(event => {
		// 處理 sticker 狀態
		stickerChange(event.target);
	});

	// 處理 Pokemon list 的查IV開關
	$("input.checkProperty.hidden").change(event => {
		// 處理 checkProperty 狀態
		checkPropertyChange(event.target);
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
				// 將 admin 新增進 admins
				admins.push(admin);
				// 讓 html 顯示出新增的 admin
				$("#admins").append(
					"<span username=" + admin + " class='tag label label-info'><span>" + admin + " "
					+ "</span><span onclick='removeAdmin(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
				);
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			$("input#admin-input").parent().parent().addClass("has-error");
		}
	}
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
				// 將 channel 新增進 channels
				channels.push(channel);
				// 讓 html 顯示出新增的 channel
				$("#channels").append(
					"<span channelId=" + channel + " class='tag label label-info'><span>" + channel + " "
					+ "</span><span onclick='removeChannel(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
				);
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			$("input#admin-input").parent().parent().addClass("has-error");
		}
	}
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
function showDistanceChange() {
	if ($("input#showDistance").is(":checked")) {
		$("button.showDistanceSubOption").removeClass("disabled");
		$("input.showDistanceSubOption").prop("disabled", false);
	} else {
		$("button.showDistanceSubOption").addClass("disabled");
		$("input.showDistanceSubOption").prop("disabled", true);
	}
}

// 處理 inform 狀態
function informChange(checkbox) {
	// 先取出 id 備用，要用來選擇各個按鈕和 ivFilter
	let id = $(event.target).attr("id");
	if ($(checkbox).parent().hasClass("btn-default")) {
		// 原本是 btn-default off 狀態，改為 btn-primary on 狀態
		$(checkbox).parent().removeClass("btn-default");
		$(checkbox).parent().addClass("btn-primary");
		// 將其他按鈕取消 disable
		$(`.subOption.${id}`).removeClass("disabled");
	} else {
		// 原本是 btn-primary on 狀態，改為 btn-default off 狀態
		$(checkbox).parent().removeClass("btn-primary");
		$(ckeckbox).parent().addClass("btn-default");
		// 將其他按鈕設為 disable
		$(`.subOption.${id}`).addClass("disabled");
	}
}

// 處理 sticker 狀態
function stickerChange(checkbox) {
	if ($(checkbox).parent().hasClass("btn-default")) {
		// 原本是 btn-default off 狀態，改為 btn-info on 狀態
		$(checkbox).parent().removeClass("btn-default");
		$(checkbox).parent().addClass("btn-info");
	} else {
		// 原本是 btn-info on 狀態，改為 btn-default off 狀態
		$(checkbox).parent().removeClass("btn-info");
		$(checkbox).parent().addClass("btn-default");
	}
}

// 處理 checkProperty 狀態
function checkPropertyChange(checkbox) {
	let id = $(event.target).attr("id");
	if ($(event.target).parent().hasClass("btn-default")) {
		// 原本是 btn-default off 狀態，改為 btn-warning on 狀態
		$(event.target).parent().removeClass("btn-default");
		$(event.target).parent().addClass("btn-warning");
		// ivFilter 設為 disable false
		$(`.ivFilter.${id}`).prop("disabled", false);
	} else {
		// 原本是 btn-warning on 狀態，改為 btn-default off 狀態
		$(event.target).parent().removeClass("btn-warning");
		$(event.target).parent().addClass("btn-default");
		// ivFilter 設為 disable true
		$(`.ivFilter.${id}`).prop("disabled", true);
	}
}

// 建立 151 隻 Pokemon 的選項清單
function createPokemonTbody() {
	for (var i = 1; i <= 151; i++) {
		let id = `<p><h4>#${i}</h4></p>`;
		let name = `<p>name</p>`;
		let img = `<p><img src="assets/pokemon-3d/${i}.png" style="width: 96px; height: 96px; object-fit: contain;"></p>`;
		let inform = `<p><label class="btn btn-default inform" style="width: 120px"><input id="${i}" class="inform hidden" type="checkbox" data-toggle="buttons">傳送通知</label></p>`;
		let sticker = `<p><label class="btn btn-default disabled sticker subOption ${i}" style="width: 120px"><input id="${i}" class="sticker hidden" type="checkbox" data-toggle="buttons">傳送帖圖</label></p>`;
		let checkProperty = `<p><label class="btn btn-default disabled checkProperty subOption ${i}" style="width: 120px"><input id="${i}" class="checkProperty hidden" type="checkbox" data-toggle="buttons">查詢IV與招式</label></p>`;
		let ivFilter = `<form class="form-inline"><p><div class="form-group"><label class="control-label">IV篩選≧</label><input id="${i}" class="form-control text-center ivFilter ${i}" type="number" onClick="this.select();" min="0" max="100" value="0" disabled></div></p></form>`;
		$("#pokemon_list").append(`<div #="${i}" class="panel panel-default col-md-4"><div class="col-md-5 text-center">${id}${name}${img}</div><div class="col-md-7 text-center"><br>${inform}${sticker}${checkProperty}${ivFilter}</div></div>`);	
	}
}