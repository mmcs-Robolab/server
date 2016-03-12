var editor = require('../modules/codeEditor');
//var socketClient = require('../modules/webSocketClient');
var loaderCompile = require('../modules/loaderCompile');

$('.topline-menu li').eq(3).addClass('active');

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
    socketClient.send(resultMessage);

    $('.btn-compile').hide();
    $('.editor-bottom-panel').append(loaderCompile.structure());

});


// ===================================================
//                    Graphics
// ===================================================

var w = $('#graph-container').width();

const RENDERER_WIDTH =  w,
      RENDERER_HEIGHT =  500;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70 , window.innerWidth / window.innerHeight , 1, 10000);
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
var controls;
var lookAt = new THREE.Vector3(0,0,0);
var viewCamPosition = new THREE.Vector3(0,0,0);

var robot = null,
    plane = null,
    viewMode = null,
    transformControls = null;

var objectList = [];

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;


init();

renderScene();


function init() {
    // ============= Renderer =============== //
    renderer.setSize(RENDERER_WIDTH, RENDERER_HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor( 0xffffff );

    // ============= Robot =============== //
    robot = createRobotModel();
    robot.position.x = -20;
    robot.position.y = 2;
    robot.position.z = 2;
    robot.name = "robot";
    robot.castShadow = true;
    scene.add(robot);

    // ============= Plane =============== //
    plane = createPlane(300, 300);
    plane.material.side = THREE.DoubleSide;
    plane.receiveShadow = true;
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    scene.add(plane);

    // ============= Camera =============== //
    camera.position.x = -30;
    camera.position.y = 80;
    camera.position.z = 30;
    camera.lookAt(scene.position);
    viewCamPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

    // ============= Light =============== //
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set(-100,200,-20);//( -40, 60, -10 );
    spotLight.castShadow = true;
    scene.add(spotLight );



    // ============= Control =============== //
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', orbitListener);
    controls.noRotate = true;
    controls.noZoom = false;

    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    transformControls.name = "transformControls";
    transformControls.addEventListener( 'change', render );

    document.getElementById( 'graph-container' ).appendChild( renderer.domElement );
}

function renderScene() {
    requestAnimationFrame(renderScene);
    render();
}


function render() {
    //console.log("pos x: " + camera.position.x + " pos y:" + camera.position.y + " pos z:" + camera.position.z + " rotx: " + camera.rotation.x + " roty:" + camera.rotation.y + " rotz:" + camera.rotation.z);
    renderer.render(scene, camera);
}

function createRobotModel2() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };

    //var mainTexture;
    //
    //var loaderTexture = new THREE.TextureLoader();
    //loaderTexture.load(
    //    "dist/img/textures/bb8.jpg",
    //    function (texture) {
    //        mainTexture = texture;
    //    },
    //    function ( xhr ) {
    //        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    //    },
    //    // Function called when download errors
    //    function ( xhr ) {
    //        console.log( 'An error happened ' );
    //    }
    //);

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
        console.log("errrrror");
    };

    // model

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'dist/img/models/body.obj', function ( object ) {

        //object.traverse( function ( child ) {
        //
        //    if ( child instanceof THREE.Mesh ) {
        //
        //        child.material.map = mainTexture;
        //
        //    }
        //
        //} );

        object.position.y = 2;
        object.scale.set(0.09,0.09,0.09);
        scene.add( object );

    }, onProgress, onError );
}

function createRobotModel() {
    var cubeGeometry = new THREE.CubeGeometry(4,4,4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});

    return new THREE.Mesh(cubeGeometry, cubeMaterial);
}

function createPlane(height, width) {
    var texture = THREE.ImageUtils.loadTexture( "dist/img/textures/plane_texture.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.repeat.set( 4, 4 );

    var planeGeometry = new THREE.PlaneGeometry(height,width,1,1);
    var planeMaterial = new THREE.MeshLambertMaterial({map: texture});

    return new THREE.Mesh(planeGeometry,planeMaterial);
}


var orbitListener = function() {
    camera.lookAt(lookAt);
    renderer.render( scene, camera );
};

var handler = function( down ) {
    return function( e ) {
        switch( e.keyCode ) {
            case 87:
                //camera.rotation.z += 10 * Math.PI / 180;
                //robot.position.x += 0.5;
                //camera.position.x += 0.5;
                //viewCamPosition.x += 0.5;
                //camera.lookAt(robot.position)
                //renderer.render(scene,camera);
                break;
        }
    };
};
//
//function onDocumentMouseMove( event ) {
//
//    event.preventDefault();
//
//    mouse.x = ( event.clientX / 800 ) * 2 - 1;//( event.clientX / window.innerWidth ) * 2 - 1;
//    mouse.y = - ( event.clientY / 800 ) * 2 + 1; //- ( event.clientY / window.innerHeight ) * 2 + 1;
//
//}

$('#graph-container').mousemove(function(e) {

    var rect = renderer.domElement.getBoundingClientRect();
    var x = ( e.clientX - rect.left ) / rect.width;
    var y = ( e.clientY - rect.top ) / rect.height;

   // pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );

    mouse.x = ( x * 2 ) - 1; // (e.clientX/500)*2 - 1; // ( event.clientX / 800 ) * 2 - 1;
    mouse.y = - ( y * 2 ) + 1; // (e.clientY/500)*2 + 1; // - ( event.clientY / 800 ) * 2 + 1;
});


function onDocumentMouseDown() {
    if(viewMode != "edit")
        return;
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children );

    console.log(intersects.length);
    if ( intersects.length > 0 ) {
        if (intersects[0].object.name == "selectable" || intersects[0].object.name == "robot") {
            if ( INTERSECTED != intersects[ 0 ].object ) {
                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(0xff0000);

                transformControls.attach(INTERSECTED);
                controls.noRotate = true;
                //scene.add(obj);
                scene.add(transformControls);

                if(INTERSECTED == robot) {
                    hideObjectPropPanel();
                    showRobotPropPanel();
                } else {
                    hideRobotPropPanel();
                    showObjectPropPanel(INTERSECTED.geometry.parameters.width,
                                        INTERSECTED.geometry.parameters.height,
                                        INTERSECTED.geometry.parameters.depth);
                }

            }
        } else {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = null;

            transformControls.detach();
            controls.noRotate = false;
            hideObjectPropPanel();
            hideRobotPropPanel();
            //scene.remove(transformControls);
            //renderer.render(scene, camera);
        }

    } else {

        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
        hideObjectPropPanel();
        hideRobotPropPanel();
    }
}

$('.btn-editor-mode').click(function() {
    if(viewMode != "edit") {
        var axes = new THREE.AxisHelper( 20 );
        axes.name = "axes";
        scene.add(axes);
    }

    lookAt = scene.position;
    camera.lookAt(lookAt);

    renderer.render( scene, camera );

    controls.noRotate = false;

    $('.btn-add-cube').removeClass('btn-add-cube-disabled');
    viewMode = "edit";
});

$('.btn-view-mode').click(function() {
    var selectedObject = scene.getObjectByName("axes");
    scene.remove( selectedObject );

    // Remove any select properties (color, axes, prop panel)
    if(INTERSECTED) {
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

        transformControls.detach();
        hideObjectPropPanel();
    }

    lookAt = robot.position;

    camera.position.x = robot.position.x;//viewCamPosition.x;
    camera.position.y = viewCamPosition.y;
    camera.position.z = robot.position.z;//viewCamPosition.z;
    camera.lookAt(lookAt);

    camera.rotation.z += 180  * Math.PI / 180;
    renderer.render( scene, camera );

    controls.noRotate = true;

    $('.btn-add-cube').addClass('btn-add-cube-disabled');
    viewMode = "view";
});

var obj;
$('.btn-add-cube').click(function() {
    var cubeGeometry = new THREE.BoxGeometry(20,10,20);
    var cubeMaterial = new THREE.MeshLambertMaterial({  map: THREE.ImageUtils.loadTexture('dist/img/textures/box_texture.jpg')}); //({color: 0xffff00});

    obj = new THREE.Mesh(cubeGeometry, cubeMaterial);
    obj.position.y = 5;
    obj.name = "selectable";


    // Remove any select properties (color, axes)
    if(INTERSECTED) {
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

        transformControls.detach();
    }

    // Select new object
    INTERSECTED = obj;
    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    INTERSECTED.material.emissive.setHex(0xff0000);
    controls.noRotate = true;
    transformControls.attach(obj);

    showObjectPropPanel(INTERSECTED.geometry.parameters.width,
                        INTERSECTED.geometry.parameters.height,
                        INTERSECTED.geometry.parameters.depth);

    scene.add(transformControls);
    objectList.push(obj);
    scene.add(objectList[objectList.length-1]);
});

$('.btn-remove-object').click(function() {
    if (INTERSECTED.name == "selectable" ) {
        scene.remove(INTERSECTED);
        INTERSECTED = null;
        transformControls.detach();

        hideObjectPropPanel();
    }
});

function showRobotPropPanel() {
    $('.prop-robot-container').show();
}

function hideRobotPropPanel() {
    $('.prop-robot-container').hide();
}

function showObjectPropPanel(width, height, depth) {
    $('.input-width').val(width);
    $('.input-height').val(height);
    $('.input-depth').val(depth);

    $('.prop-container').show();
}

function hideObjectPropPanel() {
    $('.prop-container').hide();
}

function changeSizeListener(width, height, depth) {
    var cubeGeometry = new THREE.BoxGeometry(width,height,depth);
    var cubeMaterial = new THREE.MeshLambertMaterial({  map: THREE.ImageUtils.loadTexture('dist/img/textures/box_texture.jpg')});

    var x = INTERSECTED.position.x;
    var y = INTERSECTED.position.y;
    var z = INTERSECTED.position.z;

    newObject = new THREE.Mesh(cubeGeometry, cubeMaterial);
    newObject.name = "selectable";
    newObject.position.x = x;
    newObject.position.y =newObject.geometry.parameters.height/2;
    newObject.position.z = z;
    scene.add(newObject);

    var ind = objectList.find(function(item, index, array) {
        if (item === INTERSECTED) {
            return index;
        }
    });

    objectList.splice(ind,1);
    objectList.push(newObject);
    scene.remove(INTERSECTED);

    INTERSECTED = newObject;
    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    INTERSECTED.material.emissive.setHex(0xff0000);
    controls.noRotate = true;
    transformControls.attach(INTERSECTED);
}

$('.input-width').change(function() {
    var width = $(this).val();
    var height = INTERSECTED.geometry.parameters.height;
    var depth = INTERSECTED.geometry.parameters.depth;

    changeSizeListener(width, height, depth);
});

$('.input-height').change(function() {
    var height = $(this).val();
    var width = INTERSECTED.geometry.parameters.width;
    var depth = INTERSECTED.geometry.parameters.depth;

    changeSizeListener(width, height, depth);
});

$('.input-depth').change(function() {
    var height = INTERSECTED.geometry.parameters.height;
    var width = INTERSECTED.geometry.parameters.width;
    var depth = $(this).val();

    changeSizeListener(width, height, depth);
});

$('#graph-container').click(onDocumentMouseDown);

window.addEventListener( "keydown", handler( true ), false );
//window.addEventListener( "keyup", handler( false ), false );
//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
//document.addEventListener( 'mousedown', onDocumentMouseDown, false );



// ===================================================
//                    Socket
// ===================================================


var socket = new WebSocket("ws://192.168.0.174:3003");

socket.onopen = function() {
    showMessage('Соединение установлено', 'message-success');
    showServerState('server-state-success');
   // addLogLine('Клиент подключен','log-line-success');

    //getUserInfo(function(data){
    //    user = data;
    //    socket.send('3setUserID' + ' ' + user.userId);
    //});

};

socket.onclose = function(event) {
    if (event.wasClean) {
        alert('Соединение закрыто чисто');
    } else {
        showMessage('Обрыв соединения', 'message-error');
        showServerState('server-state-error');
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


// ---------------- Functions ------------ //


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

// ---------------- Decor functions ------------ //
function showMessage(text, typeClass) {
    $('.message-container').addClass(typeClass).html(text).fadeIn(300);

    setTimeout(function() {
        $('.message-container').fadeOut(1000);
    }, 2000);
}

function showServerState(typeClass) {
    $('.server-state').addClass(typeClass);

    //setTimeout(function() {
    //    $('.message-container').fadeOut(1000);
    //}, 2000);
}