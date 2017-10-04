/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = THREE;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __webpack_require__(0);
var NetworkEntity = /** @class */ (function (_super) {
    __extends(NetworkEntity, _super);
    function NetworkEntity(uid) {
        var _this = _super.call(this) || this;
        _this.uid = uid;
        _this.lastTick = 0;
        _this.matrixAutoUpdate = false;
        return _this;
    }
    NetworkEntity.prototype.updateFromNetwork = function (tick, data) {
        if (tick <= this.lastTick) {
            return;
        }
        this.lastTick = tick;
        this.position.set(data.getFloat32(4), data.getFloat32(8), data.getFloat32(12));
        this.rotation.set(data.getFloat32(16), data.getFloat32(20), data.getFloat32(24));
        this.updateMatrix();
    };
    return NetworkEntity;
}(THREE.Object3D));
exports.default = NetworkEntity;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Game = __webpack_require__(3);
window.onload = function (e) {
    Game.init();
    Game.animate();
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __webpack_require__(0);
var localPlayer_1 = __webpack_require__(4);
var remotePlayer_1 = __webpack_require__(6);
var scene, renderer;
var player;
;
var geometry, mesh;
var wsHost = 'ws://' + window.location.hostname + ':8000';
var conn;
var players = new Map(); // Contains the players
function generateTerrain(scene) {
    // Here comes the cubes carpet
    geometry = new THREE.BoxGeometry(200, 200, 200);
    var d = 4000;
    var root = 50;
    for (var i = 0; i < root * root; i++) {
        var material = new THREE.MeshBasicMaterial({ color: Math.random() * 0x888888 + 0x777777 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;
        mesh.position.x = Math.floor(i / root) * d;
        mesh.position.z = (i % root) * -d;
        mesh.updateMatrix();
        scene.add(mesh);
    }
}
function setupWorld(scene) {
    generateTerrain(scene);
    // Some lighting
    scene.add((new THREE.HemisphereLight(0xccccff, 0x080808, 1)));
    scene.add((new THREE.AmbientLight(0x444444)));
    var light = new THREE.DirectionalLight(0xeeeeee, 1);
    light.rotation.set(4, 2, 0);
    scene.add(light);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x87CEFA);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    document.body.appendChild(renderer.domElement);
}
function generateUID() {
    return Math.floor(Math.random() * 0xffffffff);
}
function init() {
    var localUID = generateUID();
    // We just make sure that we have 8 chars in the uid
    conn = new WebSocket(wsHost + '/ws?uid=' + localUID.toString());
    conn.binaryType = 'arraybuffer';
    scene = new THREE.Scene();
    // We add the player to the scene
    player = new localPlayer_1.default(localUID, conn);
    scene.add(player);
    // We add the player to entities list
    players.set(player.uid, player);
    document.onkeydown = function (e) {
        player.keyDown(e);
    };
    document.onkeyup = function (e) {
        player.keyUp(e);
    };
    // Setup network listener
    conn.onmessage = function (e) {
        var data = new DataView(e.data);
        switch (data.getUint8(0)) {
            case 0x1:// connection
                if (data.getUint32(1) != player.uid) {
                    var newPlayer = new remotePlayer_1.default(data.getUint32(1));
                    scene.add(newPlayer);
                    players.set(newPlayer.uid, newPlayer);
                }
                break;
            case 0x2:// deconnection
                scene.remove(players.get(data.getUint32(1)));
                players.delete(data.getUint32(1));
                break;
            case 0x3:// Entiry update
                // Receive a lot of updates in the same packet
                for (var i = 0; i < data.getUint16(5); i++) {
                    var updateFrame = new DataView(e.data, 7 + i * (4 + 4 * 6), (4 + 4 * 6));
                    var playerUID = updateFrame.getUint32(0);
                    players.get(playerUID).updateFromNetwork(data.getUint32(1), updateFrame);
                }
                break;
            case 0x4:// Players list
                for (var i = 0; i < data.getUint16(1); i++) {
                    var newPlayerUID = data.getUint32(1 + 2 + i * 4);
                    var newPlayer = new remotePlayer_1.default(newPlayerUID);
                    scene.add(newPlayer);
                    players.set(newPlayerUID, newPlayer);
                }
                break;
        }
    };
    setupWorld(scene);
}
exports.init = init;
function animate() {
    requestAnimationFrame(animate);
    player.update();
    renderer.render(scene, player.camera);
}
exports.animate = animate;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __webpack_require__(0);
var networkEntity_1 = __webpack_require__(1);
var joystickInterface_1 = __webpack_require__(5);
var LocalPlayer = /** @class */ (function (_super) {
    __extends(LocalPlayer, _super);
    function LocalPlayer(uid, conn) {
        var _this = _super.call(this, uid) || this;
        _this.timeLastUpdate = (new Date()).getTime();
        _this.direction = {
            yaw: 0,
            pitch: 0,
            roll: 0
        };
        _this.thrust = 0;
        _this.conn = conn;
        _this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 50000);
        _this.camera.position.y = 1300;
        _this.camera.position.z = -2000;
        _this.camera.rotation.y = -Math.PI;
        _this.camera.rotation.x = Math.PI / 5;
        _this.add(_this.camera);
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load('dist/protoplane.json', function (geometry) {
            _this.material = new THREE.MeshLambertMaterial({ color: 0x085b08, skinning: true });
            _this.plane = new THREE.SkinnedMesh(geometry, _this.material);
            _this.add(_this.plane);
        });
        _this.joystick = new joystickInterface_1.default();
        return _this;
    }
    LocalPlayer.prototype.keyDown = function (e) {
        if (e.keyCode == 68 && this.direction.yaw == 0) {
            this.direction.yaw = -127;
        }
        if (e.keyCode == 65 && this.direction.yaw == 0) {
            this.direction.yaw = 127;
        }
        if (e.keyCode == 40 && this.direction.pitch == 0) {
            this.direction.pitch = 127;
        }
        if (e.keyCode == 38 && this.direction.pitch == 0) {
            this.direction.pitch = -127;
        }
        if (e.keyCode == 87 && this.thrust == 0) {
            this.thrust = 255;
        }
    };
    LocalPlayer.prototype.keyUp = function (e) {
        switch (e.keyCode) {
            case 68:// d
                this.direction.yaw = 0;
                break;
            case 65:// a
                this.direction.yaw = 0;
                break;
            case 40:// arrow down
                this.direction.pitch = 0;
                break;
            case 38:// arrow up
                this.direction.pitch = 0;
                break;
            case 87:// w
                this.thrust = 0;
                break;
        }
    };
    LocalPlayer.prototype.updateNetwork = function () {
        if (this.conn.readyState != 1) {
            return;
        }
        var state = new ArrayBuffer(5);
        var view = new DataView(state);
        view.setUint8(0, 0x3); // 0x3 is the instruction number for "move entity"
        view.setInt8(1, this.direction.yaw);
        view.setInt8(2, this.direction.pitch);
        //view.setInt8(3, this.direction.roll);
        view.setUint8(4, this.thrust);
        this.conn.send(view.buffer);
    };
    LocalPlayer.prototype.update = function () {
        var _this = this;
        // Gamepad logic here...
        this.joystick.update(function (inputs) {
            console.log(inputs.yaw);
            _this.thrust = inputs.thrust * 255;
            _this.direction.yaw = inputs.yaw * 127;
        });
        this.updateNetwork();
    };
    return LocalPlayer;
}(networkEntity_1.default));
exports.default = LocalPlayer;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var JoystickInterface = /** @class */ (function () {
    function JoystickInterface() {
        var _this = this;
        this.currentIndex = 1;
        this.map = {
            thrustAxis: {
                index: 0,
                min: 0,
                max: 0,
                range: 0,
                mul: 0,
            },
            rollAxis: {
                index: 0,
                min: 0,
                max: 0,
                range: 0,
                mul: 0,
            },
            pitchAxis: {
                index: 0,
                min: 0,
                max: 0,
                range: 0,
                mul: 0,
            },
            yawAxis: {
                index: 0,
                min: 0,
                max: 0,
                range: 0,
                mul: 0,
            },
            fireButton: 0,
            talkButton: 0
        };
        this.connected = false;
        window.addEventListener("gamepadconnected", function (e) {
            _this.connect(e.gamepad.index);
        });
        window.addEventListener("gamepaddisconnected", function (e) {
            _this.disconnect();
        });
        if (navigator.getGamepads()[0] != null) {
            this.connect(0);
        }
    }
    JoystickInterface.prototype.isDeviceKnow = function (deviceId) {
        return localStorage.getItem('joystick:' + deviceId) != null;
    };
    // Returns the index of the variating axis. Returns -1 if nothing changed
    JoystickInterface.prototype.findIndexOfVariation = function (low, high) {
        var axis = {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        };
        console.log(low);
        console.log(high);
        for (var i = low.length; i >= 0; i--) {
            if (high[i] == low[i])
                continue;
            if (Math.abs(high[i] - low[i]) >= axis.range) {
                console.log(i);
                axis = {
                    index: i,
                    min: low[i] > high[i] ? high[i] : low[i],
                    max: low[i] < high[i] ? high[i] : low[i],
                    range: Math.abs(high[i]) + Math.abs(low[i]),
                    mul: low[i] > high[i] ? -1 : 1,
                };
                console.log(axis.range);
            }
        }
        return axis;
    };
    // All the procedure to register a new map (axes configuration)
    JoystickInterface.prototype.registerNewMap = function (gamepadIndex, deviceId, callback) {
        var _this = this;
        var joystickMap = this.map;
        var step = 0;
        var sampleLow = [];
        var sampleHight = [];
        var intruction = document.createElement('div');
        intruction.innerText = 'You need to re-map your joystick. It will take a moment... Just click next and follow the instructions.'; // Here come the first message to be displayed
        var btnNextStep = document.createElement('button');
        btnNextStep.style.padding = '10px';
        btnNextStep.style.width = '80%';
        btnNextStep.textContent = 'Next';
        btnNextStep.style.verticalAlign = 'bottom';
        var modalBody = document.createElement('div');
        modalBody.style.position = 'fixed';
        modalBody.style.top = modalBody.style.right = modalBody.style.bottom = modalBody.style.left = '20px';
        modalBody.style.zIndex = '100';
        modalBody.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        modalBody.style.padding = '40px';
        modalBody.style.textAlign = 'center';
        modalBody.style.borderRadius = '8px';
        modalBody.appendChild(intruction);
        modalBody.appendChild(btnNextStep);
        // Setup the modal
        document.body.appendChild(modalBody);
        var stepsIntructions = [
            'THRUST -> DOWN',
            'THRUST -> UP',
            'YAW -> RIGHT',
            'YAW -> LEFT',
            'PITCH -> DOWN',
            'PITCH -> UP',
            'DONE ! Click one more time!',
            ''
        ];
        btnNextStep.onclick = function () {
            // Instructions
            intruction.innerText = stepsIntructions[step];
            var changedAxis = -1;
            // Actions
            switch (step) {
                case 0:
                    step = 1;
                    break;
                case 1:// We put the gas down for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 2;
                    break;
                case 2:// We put the gas up for reference
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;
                    joystickMap.thrustAxis = _this.findIndexOfVariation(sampleLow, sampleHight);
                    step = 3;
                    break;
                case 3:// We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 4;
                    break;
                case 4:// Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;
                    joystickMap.yawAxis = _this.findIndexOfVariation(sampleLow, sampleHight);
                    step = 5;
                    break;
                case 5:// We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 4;
                    break;
                case 6:// Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;
                    joystickMap.pitchAxis = _this.findIndexOfVariation(sampleLow, sampleHight);
                    step = 7;
                    break;
                case 7:
                    step = 8;
                    break;
                case 8:// Last Step : Save the map in the local storage
                    localStorage.setItem('joystick:' + deviceId, JSON.stringify(joystickMap));
                    // Remove the modal
                    document.body.removeChild(modalBody);
                    callback();
                    break;
            }
            ;
        };
    };
    JoystickInterface.prototype.connect = function (index) {
        var _this = this;
        var device = navigator.getGamepads()[index];
        var approve = function () {
            _this.currentIndex = index;
            _this.map = JSON.parse(localStorage.getItem('joystick:' + device.id));
            _this.connected = true;
            console.log('gamepad connected');
        };
        if (this.isDeviceKnow(device.id)) {
            approve();
        }
        else {
            this.registerNewMap(index, device.id, approve);
        }
    };
    JoystickInterface.prototype.disconnect = function () {
        this.currentIndex = -1;
        this.connected = false;
        console.log('gamepad disconnected');
    };
    JoystickInterface.prototype.update = function (callback) {
        if (this.connected) {
            var device = navigator.getGamepads()[this.currentIndex];
            var t = (device.axes[this.map.thrustAxis.index] * this.map.thrustAxis.mul + Math.abs(this.map.thrustAxis.min)) / this.map.thrustAxis.range, r = device.axes[this.map.rollAxis.index] * this.map.rollAxis.mul, p = device.axes[this.map.pitchAxis.index] * this.map.pitchAxis.mul, y = device.axes[this.map.yawAxis.index] * this.map.yawAxis.mul;
            callback({
                thrust: t,
                roll: r,
                pitch: r,
                yaw: y / (y < 0 ? -this.map.thrustAxis.min : this.map.thrustAxis.max),
                firePushed: device.buttons[this.map.fireButton].pressed,
                talkPushed: device.buttons[this.map.talkButton].pressed
            });
        }
    };
    return JoystickInterface;
}());
exports.default = JoystickInterface;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __webpack_require__(0);
var networkEntity_1 = __webpack_require__(1);
var RemotePlayer = /** @class */ (function (_super) {
    __extends(RemotePlayer, _super);
    function RemotePlayer(uid) {
        var _this = _super.call(this, uid) || this;
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load('dist/protoplane.json', function (geometry) {
            _this.material = new THREE.MeshLambertMaterial({ color: 0xf84b08 });
            _this.plane = new THREE.SkinnedMesh(geometry, _this.material);
            _this.plane.position.y = 500;
            _this.plane.position.z = 500;
            _this.add(_this.plane);
        });
        return _this;
    }
    return RemotePlayer;
}(networkEntity_1.default));
exports.default = RemotePlayer;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map