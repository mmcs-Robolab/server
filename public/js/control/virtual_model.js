var editor = require('../modules/codeEditor');
//var socketClient = require('../modules/webSocketClient');
var loaderCompile = require('../modules/loaderCompile');

$('.topline-menu li').eq(3).addClass('active');


// ===================================================
//                    Protocol
// ===================================================

// OUT

const MESSAGE_DIVIDER_COMMAND = "#";
const COMPILATION_REQ_COMMAND = "compileRobot";
const SIMULATION_CREATE_REQ_COMMAND = "createSimulation";
const SIMULATION_PAUSE_COMMAND = "pauseSimulation";

// IN

const SIMULATION_CREATE_RES_COMMAND = "creationResult";
const SIMULATION_POINTS_RES_COMMAND = "simulationPoints";
const COMPILATION_RES_COMMAND = "compilationResult";
const MESSAGE_FROM_ROBOT_COMMAND = "messageFromRobot";

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

    var resultMessage = SIMULATION_CREATE_REQ_COMMAND + MESSAGE_DIVIDER_COMMAND + sceneToJson();

    socket.send(resultMessage);
});

$('.btn-stop').click(function() {
    socket.send(SIMULATION_PAUSE_COMMAND);
    $('.btn-stop').hide();
    $('.cssload-jumping').hide();
    $('.btn-compile').show();
    playFlag = false;
});

$('#editor').keyup(function() {
    var editorText = editor.codeEditor.getValue();
    localStorage.setItem("virtualModelEditorText", editorText);
});

(function() {
    var editorText = localStorage.getItem("virtualModelEditorText");
    if(editorText)
        editor.setEditorValue(editorText);
})();

// ===================================================
//                    Socket
// ===================================================


var socket;
var isConnected = false;

function startSocketClient() {

    socket = new WebSocket("ws://192.168.0.174:3003");

    socket.onopen = function() {
        showMessage('Соединение установлено', 'message-success');
        showServerState('server-state-success');
        isConnected = true;
        // addLogLine('Клиент подключен','log-line-success');

        //getUserInfo(function(data){
        //    user = data;
        //    socket.send('3setUserID' + ' ' + user.userId);
        //});

    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            alert('Соединение закрыто чисто');
            isConnected = false;
        } else {
            showMessage('Обрыв соединения', 'message-error');
            showServerState('server-state-error');
            isConnected = false;
        }

        //try to reconnect in 5 seconds
        setTimeout(function(){startSocketClient()}, 5000);
    };

    socket.onmessage = function(event) {
        var fullMessage =  event.data;
        var message = fullMessage.split('#');
        //console.log(fullMessage);
        switch (message[0]) {
            case SIMULATION_CREATE_RES_COMMAND:
                var code = editor.codeEditor.getValue();
                var resultMessage = COMPILATION_REQ_COMMAND + MESSAGE_DIVIDER_COMMAND + "MyRobot" + MESSAGE_DIVIDER_COMMAND + code;
                socket.send(resultMessage);
                break;
            case COMPILATION_RES_COMMAND:
                showMessage("Компиляция прошла успешно", "message-success");
                $('.btn-stop').css('display', 'inline-block');
                break;
            case SIMULATION_POINTS_RES_COMMAND:
                var list = parsePointList(message);
                console.log(list);
                taskDispetcher.addPointsArray(list);
                playFlag = true;
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
        isConnected = false;
    };

}

startSocketClient();
// ---------------- Functions ------------ //

function parsePointList(list) {

    var ind = 1;
    var resArr = [];
    while(ind < list.length - 1) {

        resArr.push({
            point : new THREE.Vector3(list[ind], list[ind + 1], list[ind + 2]),
            moveType : list[ind + 3]
        });


        console.log(resArr);
        ind += 4;
    }

   // console.log(resArr);
    return resArr;
}

function parseInfoMessage(mess) {
    var messArr = mess.split('#');
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
    $('.message-container').removeClass('message-success');
    $('.message-container').removeClass('message-error');
    $('.message-container').addClass(typeClass).html(text).fadeIn(300);

    setTimeout(function() {
        $('.message-container').fadeOut(1000);
    }, 2000);
}

function showServerState(typeClass) {
    $('.server-state').removeClass('server-state-success');
    $('.server-state').removeClass('server-state-error');

    $('.server-state').addClass(typeClass);
}


// ===================================================
//                    Graphics
// ===================================================

var w = $('#graph-container').width();

const RENDERER_WIDTH =  w,
      RENDERER_HEIGHT =  500;

const PLANE_WIDTH = 300,
      PLANE_HEIGHT = 300;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70 , RENDERER_WIDTH / RENDERER_HEIGHT , 0.1, 2000);
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
var controls;
var lookAt = new THREE.Vector3(0,0,0);
var viewCamPosition = new THREE.Vector3(0,0,0);

var robot = null,
    plane = null,
    viewMode = null,
    transformControls = null;

var robotParameters = {
    direction: new THREE.Vector3(0,0,-1),
    angleAccumulator: 0
}

var robotBoundingBox = null;
var objectList = [];

var raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2(),
    INTERSECTED;

var playFlag = false;

function init() {

    // ============= Renderer =============== //
    renderer.setSize(RENDERER_WIDTH, RENDERER_HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor( 0xffffff );

    // ============= Skybox =============== //

    scene.add( makeSkybox( [
        'dist/img/textures/sky_right.jpg', // right
        'dist/img/textures/sky_left.jpg', // left
        'dist/img/textures/sky_top.jpg', // top
        'dist/img/textures/sky_bottom.jpg', // bottom
        'dist/img/textures/sky_back.jpg', // back
        'dist/img/textures/sky_front.jpg'  // front
    ], 1000 ));

    // ============= Robot =============== //
    createRobotModel2(function(model) {
        robot = model;

        var bbox = new THREE.Box3().setFromObject(robot);

        robot.position.x = 0;
        robot.position.y = bbox.size().y/2;
        robot.position.z = 0;
        //robot.rotation.y = Math.PI;
        robot.name = "robot";
        robot.castShadow = true;
        //robot.geometry.computeBoundingBox();
        //robotBoundingBox = robot.geometry.boundingBox;
        scene.add(robot);

        camera.lookAt(robot.position);
    });


    //createRobotModel2();

    // ============= Plane =============== //
    plane = createPlane(PLANE_WIDTH, PLANE_HEIGHT);
    plane.material.side = THREE.DoubleSide;
    plane.receiveShadow = true;
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    scene.add(plane);

    // ============= Camera =============== //
    camera.position.x = 0;
    camera.position.y = 20;
    camera.position.z = 30;
    //camera.lookAt(robot.position);
    viewCamPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    viewMode = "view";

    // ============= Light =============== //
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set(-100,200,-20);//( -40, 60, -10 );
    spotLight.castShadow = true;
    scene.add(spotLight);

    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);


    // ============= Control =============== //
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', orbitListener);
    controls.noRotate = true;
    controls.noZoom = true;

    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    transformControls.name = "transformControls";
    transformControls.addEventListener( 'change', render );

    document.getElementById( 'graph-container' ).appendChild( renderer.domElement );
}


function makeSkybox( urls, size ) {
    var skyboxCubemap = new THREE.CubeTextureLoader().load( urls );
    skyboxCubemap.format = THREE.RGBFormat;
    var skyboxShader = THREE.ShaderLib['cube'];
    skyboxShader.uniforms['tCube'].value = skyboxCubemap;
    return new THREE.Mesh(
        new THREE.BoxGeometry( size, size, size ),
        new THREE.ShaderMaterial({
            fragmentShader : skyboxShader.fragmentShader,
            vertexShader : skyboxShader.vertexShader,
            uniforms : skyboxShader.uniforms,
            depthWrite : false,
            side : THREE.BackSide
        })
    );
}

function createRobotModel2(callback) {

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
           // console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
        console.log("errrrror");
    };


    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl( 'dist/img/models/' );
    mtlLoader.setPath( 'dist/img/models/' );

    mtlLoader.load( 'Wall-E.mtl', function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'dist/img/models/' );
        objLoader.load( 'Wall-e.obj', function ( object ) {

            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.name = "robot";


                }
            } );

            callback(object);
        }, onProgress, onError );
    });

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

$('#graph-container').mousemove(function(e) {

    var rect = renderer.domElement.getBoundingClientRect();
    var x = ( e.clientX - rect.left ) / rect.width;
    var y = ( e.clientY - rect.top ) / rect.height;

    mouse.x = ( x * 2 ) - 1;
    mouse.y = - ( y * 2 ) + 1;

});

function onContainerMouseDown() {
    if(viewMode != "edit")
        return;
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children, true );

    if ( intersects.length > 0 ) {

        if (intersects[0].object.name == "selectable" || intersects[0].object.name == "robot") {
            if ( INTERSECTED != intersects[ 0 ].object ) {

                selectObject(intersects[0].object);
            }
        } else {

            unselectObject();

        }

    } else {

        unselectObject();
    }
}


function selectObject(object) {

    if (object.name == "selectable") {
        unselectObject();

        INTERSECTED = object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0xff0000);

        transformControls.attach(INTERSECTED);
        controls.noRotate = true;
        scene.add(transformControls);


        hideRobotPropPanel();
        showObjectPropPanel(INTERSECTED.geometry.parameters.width,
            INTERSECTED.geometry.parameters.height,
            INTERSECTED.geometry.parameters.depth);

    } else {
        unselectObject();

        INTERSECTED = object.parent;

        INTERSECTED.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.currentHex = child.material.emissive.getHex();
                child.material.emissive.setHex(0xff0000);
            }
        });

        transformControls.attach(INTERSECTED);
        controls.noRotate = true;
        scene.add(transformControls);

        hideObjectPropPanel();
        showRobotPropPanel();

    }
}

function unselectObject() {
    if(!INTERSECTED) return;

    if(INTERSECTED.name == "selectable") {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    }
    else {
        INTERSECTED.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.emissive.setHex(0x000000);
            }
        });

    }

    INTERSECTED = null;

    transformControls.detach();
    scene.remove(transformControls);
    controls.noRotate = false;
    hideObjectPropPanel();
    hideRobotPropPanel();
}

$('.btn-editor-mode').click(function() {
    if(viewMode != "edit") {
        var axes = new THREE.AxisHelper( 20 );
        axes.name = "axes";
        scene.add(axes);
    }

    lookAt = scene.position;
    camera.position.y = 40;
    camera.lookAt(lookAt);

    renderer.render( scene, camera );

    controls.noRotate = false;
    controls.noZoom = false;

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

    var relativeCameraOffset = new THREE.Vector3(0,20,30);
    var cameraOffset = relativeCameraOffset.applyMatrix4( robot.matrixWorld );
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt( lookAt );

    renderer.render( scene, camera );

    controls.noRotate = true;
    controls.noZoom = true;
    $('.btn-add-cube').addClass('btn-add-cube-disabled');

    if(isConnected && viewMode != "view") {
        alert(123);
        var jsonScene = sceneToJson();

        socket.send("updateScene#" + jsonScene);
    }
    viewMode = "view";

});

//var obj;
$('.btn-add-cube').click(function() {

    var cubeGeometry = new THREE.BoxGeometry(20,10,20);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('dist/img/textures/box_texture.jpg')});

    var obj = new THREE.Mesh(cubeGeometry, cubeMaterial);
    obj.position.y = 5;


    obj.name = "selectable";

    unselectObject();
    selectObject(obj);

    showObjectPropPanel(INTERSECTED.geometry.parameters.width,
                        INTERSECTED.geometry.parameters.height,
                        INTERSECTED.geometry.parameters.depth);

    scene.add(transformControls);
    objectList.push(obj);
    scene.add(obj);

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

$('#graph-container').click(onContainerMouseDown);
$('#graph-container').mouseenter(function() {
    document.body.style.overflow = "hidden";
});

$('#graph-container').mouseleave(function() {
    document.body.style.overflow = "";
});


function sceneToJson() {
    var mainArr = [];


    var bbox = new THREE.Box3().setFromObject(robot);

    var boundWidth = bbox.size().x;
    var boundHeight = bbox.size().y;
    var boundDepth = bbox.size().z;

    var robotObject = {
        name: "robot",
        id: 1000,
        position : {x : robot.position.x, y : robot.position.y, z : robot.position.z},
        //x: robot.position.x,
        //y: robot.position.y,
        //z: robot.position.z,
        width: boundWidth,
        height: boundHeight,
        depth: boundDepth
    };
    mainArr.push(robotObject);


    for(var i = 0; i < objectList.length; ++i) {
        console.log(objectList[i].position);
        var obj = {
            name : "barrier",
            id: i,
            position : {x : objectList[i].position.x, y : objectList[i].position.y, z : objectList[i].position.z},
            //x: objectList[i].position.x,
            //y: objectList[i].position.y,
            //z: objectList[i].position.z,
            width: objectList[i].geometry.parameters.width,
            height: objectList[i].geometry.parameters.height,
            depth: objectList[i].geometry.parameters.depth
        };

        mainArr.push(obj);
    }


    var plane = {
        name: "plane",
        id: 2000,
        x: 0,
        y: 0,
        z: 0,
        width: PLANE_WIDTH,
        height: PLANE_HEIGHT
    };

    mainArr.push(plane);
    return JSON.stringify(mainArr);
}

window.onbeforeunload = function() {
    return "Если вы обновите страницу, сцена вернется в прежнее состояние :(";
};


// ================================================ //
//                Robot movements
// ================================================ //
var arrPoints = [
    {
        point: new THREE.Vector3(0, 2, 30),
        moveType: "backward"
    },
    {
        point: new THREE.Vector3(18,2,25),
        moveType: "forward"
    },
    {
        point: new THREE.Vector3(-18,2,-25),
        moveType: "forward"
    },
    {
        point: new THREE.Vector3(-17,2,2),
        moveType: "forward"
    },
    {
        point: new THREE.Vector3(-1,2,2),
        moveType: "forward"
    }

   // new THREE.Vector3(-15,2,2),
    //new THREE.Vector3(-14,2,2),
    //new THREE.Vector3(-13,2,2),
    //new THREE.Vector3(-12,2,2),
    //new THREE.Vector3(-11,2,2),
    //new THREE.Vector3(-10,2,2),
    //new THREE.Vector3(-9,2,2),
    //new THREE.Vector3(-8,2,2),
    //new THREE.Vector3(-7,2,2),
    //new THREE.Vector3(-6,2,2),
    //new THREE.Vector3(-5,2,2),
    //new THREE.Vector3(-4,2,2),
    //new THREE.Vector3(-3,2,2),
    //new THREE.Vector3(-2,2,2),
    //new THREE.Vector3(-1,2,2),
   // new THREE.Vector3(60,2,2)

    ];




function calcAngleToPoint(targetPosition, forward) {

    var target = new THREE.Vector3().subVectors(new THREE.Vector3(targetPosition.x,0,targetPosition.z),
                                                new THREE.Vector3(robot.position.x,0,robot.position.z))
                                                .normalize();

    var direction = new THREE.Vector3();

    if (forward) {
       direction.copy(robotParameters.direction);
    } else {
        direction.copy(robotParameters.direction);
        direction.multiplyScalar(-1);
    }

    var cosAngle = direction.dot(target);
    var angle = Math.acos(cosAngle);

    var cross = new THREE.Vector3();
    cross.crossVectors(direction, target);

    if(cross.y*robot.up.y < 0) {
        angle *= -1;
    }

    return angle;
}

function rotateRobotForwardToPoint(targetPosition) {

    var rotAngle = calcAngleToPoint(targetPosition, true);

    var rotateSpeed = 0.01 * Math.PI/2;
    var sign = rotAngle?rotAngle<0?-1:1:0;

    rotateSpeed *= sign;

    if(Math.abs(robotParameters.angleAccumulator - rotAngle) > 0.01) {
        robot.rotateOnAxis(new THREE.Vector3(0,1,0), rotateSpeed);
        robotParameters.angleAccumulator += rotateSpeed;
    } else {
        robotParameters.angleAccumulator = 0;
        robotParameters.direction = robotParameters.direction.applyAxisAngle(new THREE.Vector3(0,1,0), rotAngle );
        taskDispetcher.taskComplete();
    }

}

function rotateRobotBackToPoint(targetPosition) {

    var rotAngle = calcAngleToPoint(targetPosition, false);

    var rotateSpeed = 0.01 * Math.PI/2;
    var sign = rotAngle?rotAngle<0?-1:1:0;

    rotateSpeed *= sign;

    if(Math.abs(robotParameters.angleAccumulator - rotAngle) > 0.01) {
        robot.rotateOnAxis(new THREE.Vector3(0,1,0), rotateSpeed);
        robotParameters.angleAccumulator += rotateSpeed;
    } else {
        robotParameters.angleAccumulator = 0;
        robotParameters.direction = robotParameters.direction.applyAxisAngle(new THREE.Vector3(0,1,0), rotAngle );
        taskDispetcher.taskComplete();
    }

}

function moveRobotForwardToPoint(targetPosition) {

    var moveSpeed = 0.2;
    var distance = Math.sqrt(Math.pow(targetPosition.x - robot.position.x, 2)
                            //+ Math.pow(targetPosition.y - robot.position.y, 2)
                            + Math.pow(targetPosition.z - robot.position.z, 2));

    var velocity = new THREE.Vector3();
    velocity.copy(robotParameters.direction);
    velocity.multiplyScalar(moveSpeed);


    if(distance > 0.2) {
        robot.position.add(velocity);
    } else {
        taskDispetcher.taskComplete();
    }
}

function moveRobotBackToPoint(targetPosition) {

    var moveSpeed = 0.2;
    var distance = Math.sqrt(Math.pow(targetPosition.x - robot.position.x, 2)
            //+ Math.pow(targetPosition.y - robot.position.y, 2)
        + Math.pow(targetPosition.z - robot.position.z, 2));


    var velocity = new THREE.Vector3();
    velocity.copy(robotParameters.direction);
    velocity.multiplyScalar(-moveSpeed);

    if(distance > 2) {
        robot.position.add(velocity);
    } else {
        taskDispetcher.taskComplete();
        //console.log(taskDispetcher);
    }
}

// ================================================ //
//                Task dispetcher
// ================================================ //

var taskDispetcher = {};
taskDispetcher.taskStack = [];
taskDispetcher.pointsArray = [];
taskDispetcher.curPointsArrayIndex = 0;

taskDispetcher.createPointsArray = function(arr) {
    this.pointsArray = arr.slice(0);
};

taskDispetcher.addPointsArray = function(arr) {
    this.pointsArray = this.pointsArray.concat(arr);
};

taskDispetcher.incPointsArrayIndex = function() {
    ++this.curPointsArrayIndex;
};

taskDispetcher.nullPointsArrayIndex = function() {
    this.curPointsArrayIndex = 0;
};

taskDispetcher.haveMorePoint = function() {
    return this.curPointsArrayIndex < this.pointsArray.length;
};

taskDispetcher.getCurPoint = function() {
  return this.pointsArray[this.curPointsArrayIndex];
};

taskDispetcher.newTask = function (name, point) {
    var newTask = {
        name: name,
        point: point
    };
    this.taskStack.push(newTask);
};

taskDispetcher.taskComplete = function() {
    this.taskStack.pop();
};

taskDispetcher.doTask = function() {
    var ind = this.taskStack.length - 1;
    switch(this.taskStack[ind].name) {
        case "rotateForward":
            rotateRobotForwardToPoint(this.taskStack[ind].point);
            break;
        case "rotateBack":
            rotateRobotBackToPoint(this.taskStack[ind].point);
            break;
        case "moveForward":
            moveRobotForwardToPoint(this.taskStack[ind].point);
            break;
        case "moveBack":
            moveRobotBackToPoint(this.taskStack[ind].point);
        default:
            break;
    }
};

taskDispetcher.isFree = function() {
    return this.taskStack.length == 0;
};
// ================================================ //

function renderScene() {
    playScene();
    render();
    requestAnimationFrame(renderScene);
}

function render() {
    renderer.render(scene, camera);
}

function updateCamPosition()
{
    var relativeCameraOffset = new THREE.Vector3(0,20,30);
    var cameraOffset = relativeCameraOffset.applyMatrix4( robot.matrixWorld );
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt( robot.position );

}

function playScene() {

    if(playFlag) {
        if(taskDispetcher.haveMorePoint()) {

            if(taskDispetcher.isFree()) {
                var cubeGeometry = new THREE.BoxGeometry(1,1,1);
                var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

                var obj = new THREE.Mesh(cubeGeometry, cubeMaterial);
                obj.position.copy(taskDispetcher.getCurPoint().point);
                //scene.add(obj);

                if(taskDispetcher.getCurPoint().moveType == "forward") {
                    taskDispetcher.newTask("moveForward", obj.position);
                    taskDispetcher.newTask("rotateForward", obj.position);
                } else {
                    taskDispetcher.newTask("moveBack", obj.position);
                    taskDispetcher.newTask("rotateBack", obj.position);
                }
                taskDispetcher.doTask();

                taskDispetcher.incPointsArrayIndex();
            } else {
                taskDispetcher.doTask();
            }

        } else {

            if(taskDispetcher.isFree()) {
                playFlag = false;
                taskDispetcher.nullPointsArrayIndex();
            } else {
                taskDispetcher.doTask();
            }

        }
        updateCamPosition();
    }
}

init();
renderScene();

