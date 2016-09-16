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
			let accounts;
			if (button.data("type") == "patrol") {
				accounts = patrols;
			}
			if (button.data("type") == "ivChecker") {
				accounts = ivCheckers;
			}
			
			// 取出編輯按鈕帶有的 username
			let username = button.data("username");
			// 找出他在 accounts 中的 index
			let index = indexOfUsername(accounts, username);	

			// 將要編輯的資料從 patrols 或 ivCheckers 中抓出來顯示在欄位中
			$("input#username").val(accounts[index].username);
			$("input#password").val(accounts[index].password);
			$("select#provider").val(accounts[index].provider);
			// 在 saveAccount 按鈕存入 index
			modal.find("button#saveAccount").data("index", index);
		}
		
		modal.find(".modal-title").text(action + "帳號");
		modal.find("button#saveAccount").data("action", action);
		modal.find("button#saveAccount").data("type", type);
	});

	$("button#saveAccount").click(event => {
		let button = $(event.target);
		let type = button.data("type"); 
		let username = $("input#username").val();
		let password = $("input#password").val();
		let provider = $("select#provider").val();

		let accounts;
		if (type == "patrol") {
			accounts = patrols;
		}
		if (type == "ivChecker") {
			accounts = ivCheckers;
		}

		if (username == "") {
			console.log("帳號未輸入");
		} else if (password == "") {	
			console.log("密碼未輸入");
		} else {
			let account = {
				username: username,
				password: password,
				provider: provider
			}

			if (button.data("action") == "新增") {
				if (indexOfUsername(accounts, username) >= 0) {
					console.log("帳號重複");
				} else {
					addAccount(type, account);
				}
			}
			if (button.data("action") == "編輯") {
				let index = button.data("index");
				accounts[index] = account;
				loadAccount(type, accounts);
			}
			$("#account-editor").modal("hide");
		}
	});
});

function deleteAccount(type, username) {
	let accounts;
	if (type == "patrol") {
		accounts = patrols;
	}
	if (type == "ivChecker") {
		accounts = ivCheckers;
	}
	let index = indexOfUsername(accounts, username);
	accounts.splice(index, 1);
	loadAccount(type, accounts);
}

// 找出 username 在 accounts 中的 index，回傳值跟 indexOf 一樣
function indexOfUsername(accounts, username) {
	return accounts.map(account => {
		return account.username;
	}).indexOf(username.toString());
}

function addAccount(type, account) {
	appendAccountRow(type, account);
	if (type == "patrol") {
		patrols.push(account);
	} else {
		ivCheckers.push(account);
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
	let deleteButton = `<button type="button" class="btn btn-danger btn-xs" onclick="deleteAccount('${type}', '${username}')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> 刪除</button>`;
	return editButton + " " + deleteButton;
}