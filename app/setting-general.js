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
		let id = `<div class="caption"><h4>#${i}</h4></div>`;
		let img = `<img src="assets/pokemon-3d/${i}.png" style="width: 96px; height: 96px; object-fit: contain">`;
		let imform = `<label class="btn btn-primary"><input id="${i}" class="hidden" type="checkbox" data-toggle="buttons">通知</label>`;
		let sticker = `<label class="btn btn-info"><input id="${i}" class="hidden" type="checkbox" data-toggle="buttons">帖圖</label>`;
		let checkProperty = `<label class="btn btn-warning"><input id="${i}" class="hidden" type="checkbox" data-toggle="buttons">屬性</label>`;
		let ivFilter = `<p class="text-center"><label class="control-label">IV篩選≧<input id="${i}" class="text-center" type="number" min="0" max="100" value="0"></label></p>`;
		$("#pokemon_list").append(`<div #="${i}" class=" thumbnail col-md-2">${id}${img}<br>${imform}${sticker}${checkProperty}${ivFilter}</div>`);	
	}
}