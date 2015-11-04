$(document).ready(function() {
    $('.auth-btns').click(function() {
        $(this).next().slideToggle();
    });

    $('.main-menu-btn').click(function() {
        $('.main-menu ul').slideToggle();
    });
});