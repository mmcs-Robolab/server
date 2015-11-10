var auth = {
    authentificate: function(login, pass) {
        $.ajax({
            method: "POST",
            url: "/auth",
            data: {login: login, pass: pass},
            statusCode: {
                200: function (e) {
                    //document.location.href = '/';
                    location.reload(true);
                },
                403: function (e) {
                    alert("Неверный пароль");
                },
                404: function () {
                    alert("Имени нет");
                }
            }
        });
    },
    logout: function() {
        $.ajax({
           method: "POST",
            url: "/auth/logout",
            success: function() {
                location.reload(true);
            }
        });
    }
};

module.exports = auth;