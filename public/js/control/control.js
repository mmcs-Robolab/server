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
//                    Protocol
// ===================================================

// OUT
const MESSAGE_DIVIDER_COMMAND = "#";

//compilation
const COMPILATION_REQ_COMMAND = "compileRobot";
//servers
const LIST_SERVERS_REQ_COMMAND = "listServers";
const CHOOSE_SERVER_REQ_COMMAND = "chooseServer";
//robots
const LIST_ROBOTS_REQ_COMMAND = "listRobots";
const BIND_TO_ROBOT_REQ_COMMAND = "bindToRobot";

const MESSAGE_TO_ROBOT = "messageRobot";

// IN
//compilation
const COMPILATION_RES_COMMAND = "compilationResult";

const MESSAGE_FROM_ROBOT_COMMAND = "messageFromRobot";
//servers
const LIST_SERVERS_RES_COMMAND = "servers";
const CHOOSE_SERVER_RES_COMMAND = "chosenServer";
//robots
const LIST_ROBOTS_RES_COMMAND = "robots";
const BIND_TO_ROBOT_RES_COMMAND = "bindingResult";

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

    $('.btn-compile').hide();
    $('.editor-bottom-panel').append(loaderCompile.structure());

    var code = editor.codeEditor.getValue();
    var resultMessage = COMPILATION_REQ_COMMAND + MESSAGE_DIVIDER_COMMAND + "MyRobot" + MESSAGE_DIVIDER_COMMAND + code;
    socket.send(resultMessage);
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
    //var id = $(this).val();
    //curClient = $.grep(clientsList, function(elt){ return elt.id == id; })[0];
    //createDevicesList(curClient);
    //devicesListSelect.show(200);

    socket.send(CHOOSE_SERVER_REQ_COMMAND + MESSAGE_DIVIDER_COMMAND);
});

devicesListSelect.change(function() {
    var id = $(this).val();
    curDevice = $.grep(devicesList, function(elt){ return elt == id; })[0];
    alert(curDevice);
    socket.send(BIND_TO_ROBOT_REQ_COMMAND + MESSAGE_DIVIDER_COMMAND + curDevice);
});

// ------------------------------------ //

socket.onopen = function() {
    showMessage('Соединение установлено', 'message-success');
    addLogLine('Клиент подключен','log-line-success');

    getUserInfo(function(data){
        user = data;
        socket.send(LIST_SERVERS_REQ_COMMAND); //send('3setUserID' + ' ' + user.userId);
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
    var message = fullMessage.split('#');

    alert(fullMessage);
    switch (message[0]) {

        case COMPILATION_RES_COMMAND:
            showMessage("Компиляция прошла успешно", "message-success");
            $('.btn-stop').css('display', 'inline-block');
            break;

        case LIST_SERVERS_RES_COMMAND:
            createClientsList(message);
            break;

        case LIST_ROBOTS_RES_COMMAND:
            createDevicesList(message);
            break;

        case CHOOSE_SERVER_RES_COMMAND:
            showMessage("Сервер " + message[1] + " подключен", "message-success");
            socket.send(LIST_ROBOTS_REQ_COMMAND);
            break;

        case BIND_TO_ROBOT_RES_COMMAND:
            showMessage(message[1], "message-success");
            break;
        case MESSAGE_FROM_ROBOT_COMMAND:
            showMessage(message[1], "message-success");
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

    //var jData = JSON.parse(data);
    //clientsList = jData["clients"];

    for(var i = 1; i < data.length; ++i) {
        clientsList.push(data[i]);
        var option = '<option value="' + data[i] + '">' + data[i] + '</option>';
        clientsListSelect.append(option);
    }

    //clientsList.forEach(function(item, i, arr) {
    //    var option = '<option value="' + item.id + '">' + item.name + '</option>';
    //    clientsListSelect.append(option);
    //});

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












