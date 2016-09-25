"use strict";
$(() => {
	loadConfig();

	// 註冊設定頁面三個按鈕
	$("button#save").click(saveConfig);
	$("button#reload").click(loadConfig);
	$("button#reset").click(resetConfig);

	// =============== Account =============== 

	$("#account-editor").on("show.bs.modal", event => {
		let button = $(event.relatedTarget);
		let action = button.data("action");	// 新增 or 編輯
		let modal = $(event.target);

		if (action == "新增") {
			// 清除資料
			$("input#username").val("");
			$("input#password").val("");
		}
		if (action == "編輯") {
			// 取出編輯按鈕帶有的 username
			let username = button.data("username");
			// 找出他在 accounts 中的 index
			
			let index = _.findIndex(accounts, object => {
				return object.username == username;
			});
			let account = accounts[index];

			// 將要編輯的資料從 accounts 中抓出來顯示在欄位中
			$("input#username").val(account.username);
			$("input#password").val(account.password);
			$("select#provider").val(account.provider);
			// 在 saveAccount 按鈕存入 index
			modal.find("button#saveAccount").data("index", index);
		}

		modal.find(".modal-title").text(action + "帳號");
		modal.find("button#saveAccount").data("action", action);
	});

	$("#account-editor").on("shown.bs.modal", event => {
		$("input#username").focus();
	});

	$("button#saveAccount").click(event => {
		let button = $(event.target);
		let provider = $("select#provider").val();
		let username = $("input#username").val();
		let password = $("input#password").val();
		let task = $("select#task").val();

		if (username == "") {
			console.log("帳號未輸入");
		} else if (password == "") {
			console.log("密碼未輸入");
		} else {
			let account = {
				provider: provider,
				username: username,
				password: password,
				task: task
			}

			if (button.data("action") == "新增") {
				if (_.find(accounts, object => { return object.username == username; })) {
					console.log("帳號重複");
				} else {
					addAccount(account);
				}
			}
			if (button.data("action") == "編輯") {
				let index = button.data("index");
				accounts[index] = account;
				loadAccount();
			}
			$("#account-editor").modal("hide");
		}
	});
});

function deleteAccount(username) {
	let index = indexOfUsername(accounts, username);
	accounts.splice(index, 1);
	loadAccount();
}

// 找出 username 在 accounts 中的 index，回傳值跟 indexOf 一樣
function indexOfUsername(accounts, username) {
	return accounts.map(account => {
		return account.username;
	}).indexOf(username.toString());
}

function addAccount(account) {
	accounts.push(account);
	appendAccountRow(account);
}

function appendAccountRow(account) {
	$(`#account-tbody`).append(
		`<tr>
			<td>${account.provider}</td>
			<td>${account.username}</td>
			<td>${account.password}</td>
			<td>${account.task}</td>
			<td>
				<button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-target="#account-editor" data-action="編輯" data-username="${account.username}">
					<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> 編輯
				</button>
				<button type="button" class="btn btn-danger btn-xs" onclick="deleteAccount('${account.username}')">
					<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> 刪除
				</button>
			</td>
		</tr>`
	);
}

function loadAccount() {
	// 清除 表格內容
	$(`#account-tbody`).empty();
	// 讀取帳號至表格
	accounts.forEach((account) => {
		appendAccountRow(account);
	});
}

function saveConfig() {
	configAccount = accounts;
	let json = JSON.stringify(configAccount, null, "\t");
	fs.writeFile("./config-account.json", json, { flag: "w" }, (err) => {
		if (err == null) {
			console.log("儲存成功");
		} else {
			console.log(err);
		}
	});
	// 將設定送給 main.js
	sendConfig({ account: configAccount });
}

function loadConfig() {
	try {
		// 讀取 json 設定檔
		configAccount = loadJsonConfig(pathAccount);
		// Deep copy
		accounts = jQuery.extend(true, [], configAccount);
		// 從 location 設定取出任務
		if (configLocation != null) {
			tasks = [];
			tasks = _.map(configLocation, "name");
			tasks.push("重生點掃描");
		}
	} catch (e) {
		console.log(e);
	}
	loadAccount();
}

function resetConfig() {
	accounts = [];
	loadAccount();
}