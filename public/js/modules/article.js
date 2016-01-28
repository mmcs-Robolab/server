var article = {

    artCount : 0,

    getArticles : function(callback) {
        $.ajax({
            method: "GET",
            url: "/getArticles",
            success: function(data) {

                if(data.errno) {
                    alert('Неведомая ошибка при попытке загрузить статьи из базы :(');
                } else {
                    callback(data);

                    article.artCount = data.length;
                }

            }
        });
    },

    structure : function (title, text, img, dataLength) {

        var dataLength = dataLength || 0;

        if(!dataLength)
            return '<div class="error-noart">Нет статей</div>';


        if(!img)
            return '<div class= "col-md-6 blog-item-wrap">' +
                        '<div class="blog-item">'+
                            '<div class="col-md-12">' +
                                '<div class="blog-item-title">' +
                                    '<h3>' + title +
                                '</div>' +

                                '<div class="blog-item-text">' +
                                    text + '...' +
                                '</div>' +
                            '</div>' +
                        '</div>'+
                    '</div>';

        return '<div class= "col-md-6 blog-item-wrap">' +
                    '<div class="blog-item">'+
                        '<div class="col-md-12 blog-item-img">' +
                            '<div class="blog-item-title text-al-left">' +
                                '<h3>' + title +
                            '</div>' +
                        '</div>' +
                        '<div class="row">' +
                            '<div class="col-md-5">' +

                                '<img class="post-img" src="'+ img +'">' +
                            '</div>' +

                            '<div class="col-md-7">' +
                                '<div class="blog-item-text text-al-left">' +
                                    text + '...' +
                                '</div>' +
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    }
};

module.exports = article;