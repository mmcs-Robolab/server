$(document).ready(function() {
    var owl = $('.carousel');

    owl.owlCarousel({
        items: 3,
        autoHeight : true
    });

    $(".next-btn").click(function(){
        owl.trigger('owl.next');
    });

    $(".prev-btn").click(function(){
        owl.trigger('owl.prev');
    });
});