"use strict";
$(() => {
	$("#account-editor").on("show.bs.modal", event => {
		let button = $(event.relatedTarget);
		let action = button.data("action");	// 新增 or 編輯
		let type = button.data("type");		// patrol or ivChecker
		let modal = $(event.target);

		if (action == "新增") {
			// 清除資料
			$("input#username").val("");
			$("input#password").val("");
		}
		if (action == "編輯") {
			// 將要編輯的資料從 patrols 或 ivCheckers 中抓出來顯示在欄位中
			$("input#username").val();
			$("input#password").val();
			$("select#provider").val();
		}
		
		modal.find(".modal-title").text(action + "帳號");
		modal.find("button#saveAccount").data("action", action);
		modal.find("button#saveAccount").data("type", type);
	});

	$("button#saveAccount").click(event => {
		let button = $(event.target);
		let account = {
			username: $("input#username").val(),
			password: $("input#password").val(),
			provider: $("select#provider").val()
		}

		if (button.data("action") == "新增") {
			addAccount(button.data("type"), account);
		}
		if (button.data("action") == "編輯") {

		}
	});

});

function addAccount(type, account) {
	appendAccountRow(type, account);
	if (type == "patrol") {
		patrols.push(account);
	} else {
		ivChecker.push(account);
	}
}

function appendAccountRow(type, account) {
	let username = `<td>${account.username}</td>`;
	let password = `<td>${account.password}</td>`;
	let provider = `<td>${account.provider}</td>`;
	let action = `<td>${buildActionButton(type, account.username)}</td>`;
	$(`#${type}-tbody`).append(`<tr>${username}${password}${provider}${action}</tr>`);
}

function loadAccount(type, accounts) {
	// 清除 表格內容
	$(`#${type}-tbody`).empty();
	// 讀取帳號至表格
	accounts.forEach((account) => {
		appendAccountRow(type, account);
	});
}

function buildActionButton(type, username) {
	let editButton = `<button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-target="#account-editor" data-action="編輯" data-type="${type}" data-username="${username}"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> 編輯</button>`;
	let deleteButton = `<button type="button" class="btn btn-danger btn-xs" data-toggle="modal" data-target="#account-editor" data-action="刪除" data-type="${type}" data-username="${username}"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> 刪除</button>`;
	return editButton + " " + deleteButton;
}