var socket = new WebSocket("ws://192.168.0.174:3003"); // new WebSocket("ws://195.208.237.193:3003");


// ===================================================
//                    CONST
// ===================================================
var MESSAGE_FILE_CODE = 0;
var MESSAGE_COMMAND_CODE = 1;

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

module.exports = socket;

/*
* ПРОТОКОЛ
* передача файла - в начале сообщения 0
* передача команды - в начале сообщения 1
*
*
* onmessage:
* 0 - ok
* 1 - ошибка компиляции
* 2 - ошибка выполнения(exeption какой-нибудь)
* 3 - информационное сообщение
*   0 - список подключенных клиентов
*   1 -
*
* Общение в формате JSON
*
* {
* id: 0,
* command: "getClientInfo"
* }
*
*
*
* Client info:
* name
* devices array
*
* {
*   clientName : "Name",
*   clientID: "0",
*   clientsList : [
*                   {id:"0", type:"robot"},
*                   {id:"1", type:"lamp"}
*                 ]
* }
*
*
*
*
*
* */
