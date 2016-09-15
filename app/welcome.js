$(() => {
    $("#setting").click(() => {
        if (configGeneral == null) {
            $("#main").load("setting-general.html");
        } else if (configAccount == null) {
            $("#main").load("setting-account.html");
        } else if (configLocation == null) {
            $("#main").load("setting-location.html");
        } else {
            $("#main").load("setting-general.html");
        }
    });
});