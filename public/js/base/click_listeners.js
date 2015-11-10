var auth = require('./auth');
var registration = require('./registration');

//=============================================
//               Media buttons
//=============================================

$('.auth-btns').click(function() {
    $(this).next().slideToggle();
});

$('.main-menu-btn').click(function() {
    $('.main-menu ul').slideToggle();
});


//=============================================
//               Login/registration
//=============================================

$('.btn-login').click(function() {
    var login = $('.login').val();
    var pass = $('.password').val();

    auth.authentificate(login, pass);
});

$('.btn-logout').click(function() {
    auth.logout();
});

$('.btn-registration').click(function() {
    //$('section.directions').fadeOut(100);
    //$('section.main-content').fadeOut(1000);
    //$('.top-header').animate({ height: window.innerHeight}, 1000);
    //$('.header-menu-container').fadeOut(1000);
    document.location.href = '/registration';
});

$('.signup-btn').click(function() {
    var inputs = getRegInputs();

    var res = registration.checkInputs(inputs);

    if(!res)
        return;

    var params = {
        login: $('.reg-login').val(),
        pass: $('.reg-pass').val(),
        name: $('.reg-name').val(),
        secondName: $('.reg-second-name').val(),
        email: $('.reg-email').val()
    };

    registration.registrate(params);
});

$('.row-input input').keydown(function() {
    $(this).removeClass('error-empty');
    $(this).parent().children('span').fadeOut();
});

function getRegInputs() {
    var inputArr = [];

    inputArr.push({
        elem: $('.reg-login'),
        empty: "Введите логин",
        incorrect: "Некорректный логин"
    });

    inputArr.push({
        elem: $('.reg-pass'),
        empty: "Введите пароль",
        incorrect: "Некорректный пароль"
    });

    inputArr.push({
        elem: $('.reg-name'),
        empty: "Введите имя",
        incorrect: "Некорректное имя"
    });

    inputArr.push({
        elem: $('.reg-second-name'),
        empty: "Введите фамилию",
        incorrect: "Некорректная фамилия"
    });

    inputArr.push({
        elem: $('.reg-email'),
        empty: "Введите email",
        incorrect: "Некорректный email"
    });

    return inputArr;
}

//=============================================
//
//=============================================