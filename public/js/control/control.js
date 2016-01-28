var editor = require('../modules/codeEditor');
var socketClient = require('../modules/webSocketClient');

editor.createEditor("editor");


$('.topline-menu li').eq(2).addClass('active');

$('.theme-select').change(function() {
    if(this.value != 0)
        editor.setEditorTheme(this.value);
});

$('.lang-select').change(function() {
    if(this.value != 0)
        editor.setLanguage(this.value)
        //editor.getSession().setMode("ace/mode/" + this.value);

});


$('.file-loader-input').change(function (evt) {
    var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            editor.setEditorValue(fr.result);
            $('.file-loader-input').replaceWith($('.file-loader-input').val('').clone(true));
            $('.file-loader-input').animate({width:'toggle'},350);
        }
        fr.readAsText(files[0]);
    }
});

$('.file-loader-btn').click(function () {
    $('.file-loader-input').animate({width:'toggle'},350);
});

$('.btn-compile').click(function () {

    //alert(editor.getEditorValue());
    alert(editor.codeEditor.getValue());
});