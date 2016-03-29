var editor = require('../modules/codeEditor');
//var socketClient = require('../modules/webSocketClient');
var socket = new WebSocket("ws://192.168.0.174:3003");
var loaderCompile = require('../modules/loaderCompile');

$('.topline-menu li').eq(2).addClass('active');


//var reloaded  = function(){
//    //alert(123);
//}; //страницу перезагрузили
//
//window.onload = function() {
//    var loaded = sessionStorage.getItem('loaded');
//    if(loaded) {
//        reloaded();
//    } else {
//        sessionStorage.setItem('loaded', true);
//        //alert(456);
//    }
//};

// ===================================================
//                    CONST
// ===================================================
const MESSAGE_FILE_CODE = 0;
const MESSAGE_COMMAND_CODE = 1;


// ===================================================
//                    Editor
// ===================================================

if($('#editor').length)
    editor.createEditor("editor");

$('.theme-select').change(function() {
    if(this.value != 0)
        editor.setEditorTheme(this.value);
});

$('.lang-select').change(function() {
    if(this.value != 0)
        editor.setLanguage(this.value);
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
        };
        fr.readAsText(files[0]);
    }
});

$('.file-loader-btn').click(function () {
    $('.file-loader-input').animate({width:'toggle'},350);
});

$('.btn-compile').click(function () {
    var code = editor.codeEditor.getValue();

    var resultMessage = MESSAGE_FILE_CODE + code;
    socket.send(resultMessage);

    $('.btn-compile').hide();
    $('.editor-bottom-panel').append(loaderCompile.structure());

});


$('.btn-gamepad').click(function() {
    var editorPanel = $('.editor-container');
    var gamepadPanel = $('.gamepad-container');

    if(editorPanel.css('display') != 'none') {
        editorPanel.hide();
        gamepadPanel.show();
    } else {
        gamepadPanel.hide();
        editorPanel.show();
    }

    //$('.code-area').slideUp();
});

$('#editor').keyup(function() {
    var editorText = editor.codeEditor.getValue();
    localStorage.setItem("remoteControlEditorText", editorText);
});

(function() {
    var editorText = localStorage.getItem("remoteControlEditorText");
    if(editorText)
        editor.setEditorValue(editorText);
})();

// =====================================================
//                         Socket
// =====================================================

// ------------------- User info ---------------- //

var user = {};

// ------------------- Objects ----------------- //
var clientsList = [];      // list of all remote clients
var devicesList = [];
var curClient;
var curDevice;

var clientsListSelect = $('.select-clients'); // html select of clients list
var devicesListSelect = $('.select-devices');

clientsListSelect.change(function() {
    // изменить камеру на камеру нового клиента
    var id = $(this).val();
    curClient = $.grep(clientsList, function(elt){ return elt.id == id; })[0];
    createDevicesList(curClient);
    devicesListSelect.show(200);
});

devicesListSelect.change(function() {
    var id = $(this).val();
    curDevice = $.grep(devicesList, function(elt){ return elt.id == id; })[0];
});

// ------------------------------------ //


socket.onopen = function() {
    showMessage('Соединение установлено', 'message-success');
    addLogLine('Клиент подключен','log-line-success');

    getUserInfo(function(data){
        user = data;
        socket.send('3setUserID' + ' ' + user.userId);
    });

};

socket.onclose = function(event) {
    if (event.wasClean) {
        alert('Соединение закрыто чисто');
    } else {
        showMessage('Обрыв соединения', 'message-error');

    }
};

socket.onmessage = function(event) {
    var fullMessage =  event.data;
    var message = fullMessage.slice(1);

    switch (fullMessage[0]) {
        case "0":
            showMessage(message, 'message-success');
            break;
        case "1":
        case "2":
            showMessage(message, 'message-error');
            break;
        case "3":
            parseInfoMessage(message);
            break;
    }

    $('.cssload-jumping').remove();
    $('.btn-compile').show();
};

socket.onerror = function(error) {
    //alert("Ошибка " + error);
    showMessage('Не удается установить соединение с сервером', 'message-error');
};

// =====================================================
//                   Functions
// =====================================================

$('.gamepad-btn').click(function() {
    switch ($(this).attr('id')) {
        case 'btn-up':
            console.log(curDevice);
            socket.send(MESSAGE_COMMAND_CODE + ' ' + curClient.id + ' ' + curDevice.id + ' goForward');
            break;
        case 'btn-left':
            socket.send(MESSAGE_COMMAND_CODE + ' ' + curClient.id + ' ' + curDevice.id + ' goLeft');
            break;
        case 'btn-right':
            socket.send(MESSAGE_COMMAND_CODE + ' ' + curClient.id + ' ' + curDevice.id + ' goRight');
            break;
        case 'btn-down':
            socket.send(MESSAGE_COMMAND_CODE + ' ' + curClient.id + ' ' + curDevice.id + ' goBack');
            break;
    }
});

function parseInfoMessage(mess) {
    var messArr = mess.split('#');
    //console.log(messArr);
    switch (messArr[0]) {
        case 'setUserID':
            socket.send('3getClients');
            break;

        case 'setClientsList':
            createClientsList(messArr[1]);
            break;
    }
}

function createClientsList(data) {

    var jData = JSON.parse(data);
    clientsList = jData["clients"];

    clientsList.forEach(function(item, i, arr) {
        var option = '<option value="' + item.id + '">' + item.name + '</option>';
        clientsListSelect.append(option);
    });

    addLogLine('Имеется ' + clientsList.length + ' клиентов', '');
}

function createDevicesList(curClient) {
    devicesList = curClient.deviceList;

    devicesList.forEach(function(item, i, arr) {
        var option = '<option value="' + item.id + '">' + item.name + '</option>';
        devicesListSelect.append(option);
    });
}

function getUserInfo(callback) {
    $.ajax({
        method: "GET",
        url: "auth/userInfo",
        success: function(data) {
            callback(data);
        }
    });
}


// ---------------- Decor functions ------------ //
function showMessage(text, typeClass) {
    $('.message-container').addClass(typeClass).html(text).fadeIn(300);

    setTimeout(function() {
        $('.message-container').fadeOut(1000);
    }, 2000);
}

function addLogLine(text, typeClass) {
    var logLine = '<div class="log-line ' + typeClass + '">' + text + '</div>';

    $('.log-container').append(logLine);
}




// ===================================================
//                    Gamepad
// ===================================================

//var btnDownFlag = true;

//$('.gamepad-btn').mousedown(function() {
//    var counter = 0;
//    while(btnDownFlag) {
//        counter++;
//        //if(counter > 100000 && counter < 100002) {
//        //    alert(10000);
//        //}
//    }
//});

//$('.gamepad-btn').mouseup(function() {
//    btnDownFlag = false;
//    alert('ok');
//});

//$('.gamepad-btn').click(function() {
//    switch ($(this).attr('id')) {
//        case 'btn-up':
//            socketClient.send(MESSAGE_COMMAND_CODE + ' goForward');
//            break;
//        case 'btn-left':
//            socketClient.send(MESSAGE_COMMAND_CODE + ' goLeft');
//            break;
//        case 'btn-right':
//            socketClient.send(MESSAGE_COMMAND_CODE + ' goRight');
//            break;
//        case 'btn-down':
//            socketClient.send(MESSAGE_COMMAND_CODE + ' goBack');
//            break;
//    }
//});












