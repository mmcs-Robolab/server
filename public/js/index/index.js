var article = require('../modules/article');
var math = require('../modules/math');

$('.topline-menu li').first().addClass('active');



// =================================================
//                  Articles block
// =================================================

var ARCTICLE_PATH = "articles/";

article.getArticles(createArticles);

function createArticles(data) {
    var title = "",
        html = "",
        img = "";

    var arrLinks = [];

    for(var i in data) {
        title = data[i].title;
        html = data[i].html;
        img = data[i].img;
        arrLinks.push(data[i].link);

        html  = html.split(' ').slice(0,26).join(' ');

        var articleHtml = article.structure(title, html, img, data.length);

        if (math.even(i)) {
            $('.news-container').append('<div class = "row row-news"></div>');
            $('.row-news').last().append(articleHtml);
        } else {
            $('.row-news').last().append(articleHtml);
        }

        var actionObjId = 'post_' + i;

        $('.blog-item').last().attr('id', actionObjId);

        $('#' + actionObjId).on('click', function() {
            var id = $(this).attr('id').replace('post_', '');

            location.href = ARCTICLE_PATH + arrLinks[id];
        });


    }
}

// =================================================
//                  Gallery block
// =================================================

$.ajax({
    method: "GET",
    url: "/getPhotos",
    success: function(data) {

        if(data.errno) {
            alert('Неведомая ошибка при попытке загрузить фотографии в галерею :(');
        } else {
            createGallery(data);
        }

    }
});

function createGallery(list) {
    var imgList = list;
    var CONTAINER_COUNT = Math.ceil(imgList.length / 7);
    var curContainer = 0;
    var curImgNum = 0;

    var leftBtn = $('.gal-btn-left');
    var rightBtn = $('.gal-btn-right');
    var leftBtnThumb = $('.thumbs-btn-left');
    var rightBtnThumb = $('.thumbs-btn-right');
    var imgLg = $('.gal-img-lg');


    var containers = createThumbContainers(imgList, function(res) {
        var thumbs = $('.thumbs');

        thumbs.append(res[curContainer]);
        bindImgSmClick();
    });


    $('.gal-img-sm').first().addClass('gal-img-sm-active');
    imgLg.attr('src', imgList[0]);


    //=================== Large image buttons ===================//

    leftBtn.click(function() {
        if(curImgNum == 0)
           return;

        curImgNum--;

        changeImage(imgList[curImgNum]);
    });

    rightBtn.click(function() {
        if(curImgNum == imgList.length - 1)
            return;

        curImgNum++;

        changeImage(imgList[curImgNum]);
    });

    //=====================================================//


    //=================== Thumb buttons ===================//

    rightBtnThumb.click(function() {
        if(curContainer == CONTAINER_COUNT - 1)
            return;

        replaceContainers(curContainer + 1);
        curContainer++;
    });

    leftBtnThumb.click(function() {
        if(curContainer == 0)
            return;

        replaceContainers(curContainer - 1);
        curContainer--;
    });

    //=====================================================//


    function createThumbContainers(imgList, callback) {
        var containers = [];
        var count = 0;
        for(var i = 0; i < CONTAINER_COUNT; ++i) {

            var thumbsContainer = '<div class="thumbs-container">';

            for(var j = i*7; j < imgList.length; ++j) {

                if(count == (i+1) * 7){
                    break;
                }


                var newThumb = '<div class="thumb"><img src="' + imgList[j] + '" class="gal-img-sm"></div>';
                thumbsContainer += newThumb;
                count ++;
            }

            containers.push(thumbsContainer);
        }

        callback(containers);
        return containers;
    }

    function replaceContainers(num) {
        $('.thumbs-container').animate({
            opacity: 0
        }, 300, function() {
            $('.thumbs-container').remove();

            var thumbs = $('.thumbs');
            thumbs.append(containers[num]);

            var imgEl = $("img.gal-img-sm[src='"+imgList[curImgNum]+"']");
            imgEl.addClass('gal-img-sm-active');

            bindImgSmClick();
        });
    }

    function changeImage(img) {
        imgLg.attr('src', img);
        $('.gal-img-sm').removeClass('gal-img-sm-active');
        var imgEl = $("img.gal-img-sm[src='"+img+"']");
        imgEl.addClass('gal-img-sm-active');
        curImgNum = imgList.indexOf(img);

        if(curImgNum >= (curContainer + 1) * 7) {
            replaceContainers(curContainer+1);
            curContainer++;
        } else if(curImgNum < (curContainer + 1) * 7 - 7) {
            replaceContainers(curContainer-1);
            curContainer--;
        }
    }

    function bindImgSmClick() {
        $('.gal-img-sm').click(function() {
            changeImage($(this).attr('src'));
        });
    }

}
