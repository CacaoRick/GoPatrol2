"use strict";
// 註冊 header click 事件
$(() => {
    $(".navbar-brand").click(() => {
		checkConfig();
	});

	$("#data").click(() => {
        console.log("data");
		$("#main").load("data.html");
	});

	$("#setting-general").click(() => {
		$("#main").load("setting-general.html");
        
	});

	$("#setting-account").click(() => {
		$("#main").load("setting-account.html");
        
	});

	$("#setting-location").click(() => {
		$("#main").load("setting-location.html");
        
	});
});