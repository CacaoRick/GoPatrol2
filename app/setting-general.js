let admins = [];
let channels = [];
let regexp = /^[a-zA-Z@][a-zA-Z0-9_]{3,29}[a-zA-Z0-9]$/;
$(() => {

	// 產生 Pokemon List
	createPokemonTbody();

	// 加入新管理員 By Enter
	$("input#admin-input").keypress(e => {
		if (e.which == 13) {
			addAdmin();
		}
	});

	// 加入新管理員 By Button
	$("button#add-admin").click(() => {
		addAdmin();
	});

	// 加入新頻道 By Enter
	$("input#channel-input").keypress(e => {
		if (e.which == 13) {
			addChannel();
		}
	});

	// 加入新頻道 By Button
	$("button#add-channel").click(() => {
		addChannel();
	});

	$("input.inform.hidden").click(event => {
		let id = $(event.currentTarget).attr("id");
		if ($(event.currentTarget).parent().hasClass("btn-default")) {
			$(event.currentTarget).parent().removeClass("btn-default");
			$(event.currentTarget).parent().addClass("btn-primary");
			$(`.subOption.${id}`).removeClass("disabled");
			$(`.ivFilter.${id}`).prop("disabled", false);
		} else {
			$(event.currentTarget).parent().removeClass("btn-primary");
			$(event.currentTarget).parent().addClass("btn-default");
			$(`.subOption.${id}`).addClass("disabled");
			$(`.ivFilter.${id}`).prop("disabled", true);
		}
	});

	$("input.sticker.hidden").click(event => {
		if (!$(event.currentTarget).parent().hasClass("disabled")) {
			if ($(event.currentTarget).parent().hasClass("btn-default")) {
				$(event.currentTarget).parent().removeClass("btn-default");
				$(event.currentTarget).parent().addClass("btn-info");
			} else {
				$(event.currentTarget).parent().removeClass("btn-info");
				$(event.currentTarget).parent().addClass("btn-default");
			}
		}
	});

	$("input.checkProperty.hidden").click(event => {
		if (!$(event.currentTarget).parent().hasClass("disabled")) {
			if ($(event.currentTarget).parent().hasClass("btn-default")) {
				$(event.currentTarget).parent().removeClass("btn-default");
				$(event.currentTarget).parent().addClass("btn-warning");
			} else {
				$(event.currentTarget).parent().removeClass("btn-warning");
				$(event.currentTarget).parent().addClass("btn-default");
			}
		}
	});
});

// 新增管理員
function addAdmin() {
	let admin = $("input#admin-input").val();
	if (admin != "") {
		if (regexp.test(admin)) {
			if (admins.indexOf(admin) < 0) {
				$("input#admin-input").val("");
				admins.push(admin);
				$("#admins").append(
					"<span username=" + admin + " class='tag label label-info'><span>" + admin + " "
					+ "</span><span onclick='removeAdmin(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
				);
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
			console.log("需為英文、數字或底線，但不可以底線作為開頭和結尾");
		}
	}
}

// 刪除管理員
function removeAdmin(span) {
	let index = admins.indexOf($(span).parent().attr("username"));
	admins.splice(index, 1);
	$(span).parent().remove();
}

// 新增頻道
function addChannel() {
	let channel = $("input#channel-input").val();
	if (channel != "") {
		if (regexp.test(channel)) {
			if (channels.indexOf(channel) < 0) {
				$("input#channel-input").val("");
				channels.push(channel);
				$("#channels").append(
					"<span channelId=" + channel + " class='tag label label-info'><span>" + channel + " "
					+ "</span><span onclick='removeChannel(this);' class='glyphicon glyphicon-remove glyphicon-white'></span></span> "
				);
			} else {
				// 已加入過
			}
		} else {
			// 需為英文、數字或底線，但不可以底線作為開頭和結尾
		}
	}
}

// 刪除頻道
function removeChannel(span) {
	let index = channels.indexOf($(span).parent().attr("channelId"));
	channels.splice(index, 1);
	$(span).parent().remove();
}

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