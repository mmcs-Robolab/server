var regForm = {
    structure : function () {
       return '<div class="container reg-form">'+
                '<div class="col-md-12">' +
                    '<div class="registration-block">' +
                        '<div class="row form-title-row">' +
                            '<a href="#"><i class="fa fa-arrow-left back-href"></i></a>' +
                            '<h2>Создание аккаунта</h2>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<input type="text" name="name" maxlength="10" placeholder="Логин" class="reg-login"/>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<input type="password" name="name" maxlength="20" placeholder="Пароль" class="reg-pass"/>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<input type="text" name="name" maxlength="15" placeholder="Имя" class="reg-name"/>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<input type="text" name="name" maxlength="15" placeholder="Фамилия" class="reg-second-name"/>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<input type="text" name="name" maxlength="15" placeholder="E-mail" class="reg-email"/>' +
                        '</div>' +
                        '<div class="row row-input">' +
                            '<div class="signup-btn">Регистрация</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }
};

module.exports = regForm;