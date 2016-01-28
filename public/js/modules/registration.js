var reg = {
    registrate: function(params) {
        $.ajax({
            method: "POST",
            url: "/registration",
            data: {
                login: params.login,
                pass: params.pass,
                name: params.name,
                secondName: params.secondName,
                email: params.email
            },
            statusCode: {
                200: function () {
                    document.location.href = '/';
                },
                500: function () {
                    var errorHintElem = document.createElement('span');
                    $(errorHintElem).addClass('error-hint');
                    $(errorHintElem).html("Логин занят");

                    $(".reg-login").addClass('error-empty');
                    $(".reg-login").parent().append(errorHintElem);
                }
            }
        });
    },

    checkInputs: function(inputs) {
        var resVal = true;

        inputs.forEach(function(item, i, arr) {
            var val = $(item.elem).val();
            if(!val) {
                var errorHintElem = document.createElement('span');
                $(errorHintElem).addClass('error-hint');
                $(errorHintElem).html(item.empty);

                $(item.elem).addClass('error-empty');
                $(item.elem).parent().append(errorHintElem);
                
                resVal = false;
                return;
            }

            if(!item.reg.test(val)) {
                var errorHintElem = document.createElement('span');
                $(errorHintElem).addClass('error-hint');
                $(errorHintElem).html(item.incorrect);

                $(item.elem).addClass('error-incorrect');
                $(item.elem).parent().append(errorHintElem);

                resVal = false;
            }
        });

        return resVal;
    }
};

module.exports = reg;