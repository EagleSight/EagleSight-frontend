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
    function NetworkEntity() {
        var _this = _super.call(this) || this;
        _this.lastTick = 0;
        _this.matrixAutoUpdate = false;
        _this.rotation.order = 'YZX';
        return _this;
    }
    NetworkEntity.prototype.updateFromNetwork = function (data) {
        this.position.set(data.getFloat32(3), data.getFloat32(7), data.getFloat32(11));
        this.rotation.set(data.getFloat32(15), data.getFloat32(19), data.getFloat32(23));
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
var arenaMap_1 = __webpack_require__(7);
var scene, renderer;
var player;
var geometry, mesh;
var wsHost = 'ws://' + window.location.hostname + ':8000';
var conn;
var players = new Map(); // Contains the players
function SetUpTerrain(scene) {
    fetch('/dist/map.esmap', {}).then(function (resp) {
        return resp.arrayBuffer();
    }).then(function (arr) {
        scene.add(new arenaMap_1.default(arr));
    });
}
function setupWorld(scene) {
    SetUpTerrain(scene);
    // Some lighting
    scene.add((new THREE.HemisphereLight(0xeeeeeeff, 0x080808, 1)));
    scene.add((new THREE.AmbientLight(0x444444)));
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x87CEFA);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setPixelRatio(devicePixelRatio);
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    // dirLight.shadowCameraVisible = true;
    dirLight.castShadow = true;
    scene.add(dirLight);
    document.body.appendChild(renderer.domElement);
}
function init() {
    // We just make sure that we have 8 chars in the uid
    conn = new WebSocket(wsHost + '/ws?uuid=' + window.location.hash.substr(1));
    conn.binaryType = 'arraybuffer';
    scene = new THREE.Scene();
    // Init player
    player = new localPlayer_1.default(conn);
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
                var newPlayer = new remotePlayer_1.default();
                scene.add(newPlayer);
                players.set(data.getUint8(1), newPlayer);
                break;
            case 0x2:// deconnection
                scene.remove(players.get(data.getUint8(1)));
                players.delete(data.getUint8(1));
                break;
            case 0x3:// Entity update
                // We won't accept any update with we have nothing to update on
                if (players.size === 0) {
                    break;
                }
                // Receive a lot of updates in the same packet
                for (var i = 0; i < data.getUint8(1); i++) {
                    var updateFrame = new DataView(e.data, 2 + i * (3 + 4 * 6), (3 + 4 * 6));
                    var playerUID = updateFrame.getUint8(0);
                    if (players.has(playerUID)) {
                        players.get(playerUID).updateFromNetwork(updateFrame);
                    }
                }
                break;
            case 0x4:// Players list
                // We add the player to the scene
                scene.add(player);
                // We add the player to entities list
                players.set(data.getUint8(1), player);
                for (var i = 0; i < data.byteLength - 2; i++) {
                    var newPlayerUID = data.getUint8(2 + i);
                    var newPlayer = new remotePlayer_1.default();
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
    function LocalPlayer(conn) {
        var _this = _super.call(this) || this;
        _this.timeLastUpdate = (new Date()).getTime();
        _this.direction = {
            pitch: 0,
            roll: 0,
            yaw: 0,
        };
        _this.keyMapping = {
            rollUp: 65,
            rollDown: 68,
            pitchUp: 87,
            pitchDown: 83,
            yawUp: 37,
            yawDown: 39,
            thrustUp: 32 // Space bare
        };
        _this.thrust = 0;
        _this.conn = conn;
        _this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500000);
        _this.camera.position.y = 3;
        _this.camera.position.z = -10;
        _this.camera.rotation.y = -Math.PI;
        //this.camera.rotation.x = Math.PI / 5;
        _this.add(_this.camera);
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load('dist/protoplane.json', function (geometry) {
            _this.material = new THREE.MeshLambertMaterial({ color: 0x085b08 });
            _this.plane = new THREE.SkinnedMesh(geometry, _this.material);
            _this.plane.scale.set(0.005, 0.005, 0.005);
            _this.add(_this.plane);
        });
        _this.joystick = new joystickInterface_1.default();
        return _this;
    }
    LocalPlayer.prototype.keyDown = function (e) {
        // ROLL
        if (e.keyCode == this.keyMapping.rollUp && this.direction.pitch == 0) {
            this.direction.roll = 127;
        }
        if (e.keyCode == this.keyMapping.rollDown && this.direction.pitch == 0) {
            this.direction.roll = -127;
        }
        // PITCH
        if (e.keyCode == this.keyMapping.pitchUp && this.direction.pitch == 0) {
            this.direction.pitch = 127;
        }
        if (e.keyCode == this.keyMapping.pitchDown && this.direction.pitch == 0) {
            this.direction.pitch = -127;
        }
        // YAW
        if (e.keyCode == this.keyMapping.yawUp && this.direction.yaw == 0) {
            this.direction.yaw = 127;
        }
        if (e.keyCode == this.keyMapping.yawDown && this.direction.yaw == 0) {
            this.direction.yaw = -127;
        }
        // THRUST
        if (e.keyCode == this.keyMapping.thrustUp && this.thrust == 0) {
            this.thrust = 255;
        }
    };
    LocalPlayer.prototype.keyUp = function (e) {
        switch (e.keyCode) {
            // ROLL
            case this.keyMapping.rollUp:
                this.direction.roll = 0;
                break;
            case this.keyMapping.rollDown:
                this.direction.roll = 0;
                break;
            // PITCH
            case this.keyMapping.pitchUp:
                this.direction.pitch = 0;
                break;
            case this.keyMapping.pitchDown:
                this.direction.pitch = 0;
                break;
            // YAW
            case this.keyMapping.yawUp:
                this.direction.yaw = 0;
                break;
            case this.keyMapping.yawDown:
                this.direction.yaw = 0;
                break;
            // THRUST
            case this.keyMapping.thrustUp:
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
        view.setInt8(1, this.direction.roll);
        view.setInt8(2, this.direction.pitch);
        view.setInt8(3, this.direction.yaw);
        view.setUint8(4, this.thrust);
        this.conn.send(view.buffer);
    };
    LocalPlayer.prototype.update = function () {
        var _this = this;
        // Gamepad logic here...
        this.joystick.update(function (inputs) {
            _this.thrust = inputs.thrust * 255;
            _this.direction.roll = inputs.roll * 127;
            _this.direction.pitch = inputs.pitch * 127;
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
            'PITCH -> UP',
            'PITCH -> DOWN',
            'ROLL -> RIGHT',
            'ROLL -> LEFT',
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
                    step = 6;
                    break;
                case 6:// Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;
                    joystickMap.pitchAxis = _this.findIndexOfVariation(sampleLow, sampleHight);
                    step = 7;
                    break;
                case 7:// We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 8;
                    break;
                case 8:// Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;
                    joystickMap.rollAxis = _this.findIndexOfVariation(sampleLow, sampleHight);
                    step = 9;
                    break;
                case 9:
                    step = 10;
                    break;
                case 10:// Last Step : Save the map in the local storage
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
                pitch: p,
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
    function RemotePlayer() {
        var _this = _super.call(this) || this;
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load('dist/protoplane.json', function (geometry) {
            _this.material = new THREE.MeshLambertMaterial({ color: 0xf84b08 });
            _this.plane = new THREE.SkinnedMesh(geometry, _this.material);
            _this.position.y = 100;
            _this.position.z = 300;
            _this.plane.scale.set(0.005, 0.005, 0.005);
            _this.add(_this.plane);
        });
        return _this;
    }
    return RemotePlayer;
}(networkEntity_1.default));
exports.default = RemotePlayer;


/***/ }),
/* 7 */
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
var ArenaMap = /** @class */ (function (_super) {
    __extends(ArenaMap, _super);
    function ArenaMap(source) {
        var _this = this;
        console.time();
        var sourceView = new DataView(source);
        var width = sourceView.getUint16(0, true), depth = sourceView.getUint16(2, true), distance = sourceView.getFloat32(6, true);
        var pts = new Int16Array(source, 2 + 2 + 2 + 4, width * depth);
        var vertices = new Float32Array((width - 1) * (depth - 1) * 9 * 2);
        var i = 0;
        for (var r = 0; r < depth - 1; r++) {
            for (var c = 0; c < width - 1; c++) {
                var p = r * width + c;
                var RIGHT = (c + 1) * distance, LEFT = c * distance; // Where i is
                var UP = r * distance, // Where i is
                DOWN = (r + 1) * distance;
                //    30------2
                //    | \     |
                //    |   \   |
                //    |     \ |
                //    4------51
                vertices.set([
                    // FIRST TRIANGLE
                    // UP LEFT
                    LEFT,
                    pts[p],
                    UP,
                    // DOWN RIGHT
                    RIGHT,
                    pts[p + width + 1],
                    DOWN,
                    // UP RIGHT
                    RIGHT,
                    pts[p + 1],
                    UP,
                    // SECOND TRIANGLE
                    // UP LEFT
                    LEFT,
                    pts[p],
                    UP,
                    // DOWN LEFT
                    LEFT,
                    pts[p + width],
                    DOWN,
                    // DOWN RIGHT
                    RIGHT,
                    pts[p + width + 1],
                    DOWN,
                ], i * 9 * 2);
                i++;
            }
        }
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        var material = new THREE.MeshLambertMaterial({ color: 0x222222 });
        _this = _super.call(this, geometry, material) || this;
        console.timeEnd();
        return _this;
    }
    return ArenaMap;
}(THREE.Mesh));
exports.default = ArenaMap;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzg0NGZkOTIyY2Q3NTVmMmY0YzUiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiVEhSRUVcIiIsIndlYnBhY2s6Ly8vLi9zcmMvbmV0d29ya0VudGl0eS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZ2FtZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9jYWxQbGF5ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pveXN0aWNrSW50ZXJmYWNlLnRzIiwid2VicGFjazovLy8uL3NyYy9yZW1vdGVQbGF5ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FyZW5hTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSx1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLG1DQUErQjtBQUUvQjtJQUM0QixpQ0FBYztJQUl0QztRQUFBLFlBQ0ksaUJBQU8sU0FPVjtRQUxHLEtBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFOUIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztJQUNoQyxDQUFDO0lBRUQs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QUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUN0SSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQ2hFLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFDbEUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBRW5FLFFBQVEsQ0FBQztnQkFDTCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxJQUFJLEVBQUUsQ0FBQztnQkFDUCxLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3JFLFVBQVUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTztnQkFDdkQsVUFBVSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcs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O1FBRTFCLE9BQU8sQ0FBQyxPQUFPLEVBQUU7O0lBRXJCLENBQUM7SUFFTCxlQUFDO0FBQUQsQ0FBQyxDQTdGMEIsS0FBSyxDQUFDLElBQUksR0E2RnBDIiwiZmlsZSI6ImRpc3QvYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMzg0NGZkOTIyY2Q3NTVmMmY0YzUiLCJtb2R1bGUuZXhwb3J0cyA9IFRIUkVFO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiVEhSRUVcIlxuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5cbmV4cG9ydCBkZWZhdWx0XG5jbGFzcyBOZXR3b3JrRW50aXR5IGV4dGVuZHMgVEhSRUUuT2JqZWN0M0Qge1xuXG4gICAgcHJpdmF0ZSBsYXN0VGljazogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5sYXN0VGljayA9IDA7XG5cbiAgICAgICAgdGhpcy5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7ICAgICAgICBcblxuICAgICAgICB0aGlzLnJvdGF0aW9uLm9yZGVyID0gJ1laWCc7XG4gICAgfVxuXG4gICAgdXBkYXRlRnJvbU5ldHdvcmsoZGF0YTogRGF0YVZpZXcpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoZGF0YS5nZXRGbG9hdDMyKDMpLCBkYXRhLmdldEZsb2F0MzIoNyksIGRhdGEuZ2V0RmxvYXQzMigxMSkpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLnNldChkYXRhLmdldEZsb2F0MzIoMTUpLCBkYXRhLmdldEZsb2F0MzIoMTkpLCBkYXRhLmdldEZsb2F0MzIoMjMpKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuXG4gICAgfVxuXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL25ldHdvcmtFbnRpdHkudHMiLCJpbXBvcnQgKiBhcyBHYW1lIGZyb20gJy4vZ2FtZSdcblxuXG53aW5kb3cub25sb2FkID0gKGUpID0+IHtcbiAgICBHYW1lLmluaXQoKTtcblxuICAgIEdhbWUuYW5pbWF0ZSgpO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYWluLnRzIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuaW1wb3J0IExvY2FsUGxheWVyIGZyb20gJy4vbG9jYWxQbGF5ZXInXG5pbXBvcnQgUmVtb3RlUGxheWVyIGZyb20gJy4vcmVtb3RlUGxheWVyJ1xuaW1wb3J0IE5ldHdvcmtFbnRpdHkgZnJvbSAnLi9uZXR3b3JrRW50aXR5J1xuaW1wb3J0IEFyZW5hTWFwIGZyb20gJy4vYXJlbmFNYXAnXG5cbnZhciBzY2VuZTogVEhSRUUuU2NlbmUsXG4gICAgcmVuZGVyZXI6IFRIUkVFLldlYkdMUmVuZGVyZXI7XG5cbnZhciBwbGF5ZXI6IExvY2FsUGxheWVyO1xuXG52YXIgZ2VvbWV0cnk6IFRIUkVFLkJveEdlb21ldHJ5LFxuICAgIG1lc2g6IFRIUkVFLk1lc2g7XG5cbmNvbnN0IHdzSG9zdCA9ICd3czovLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOjgwMDAnO1xudmFyIGNvbm46IFdlYlNvY2tldDtcblxudmFyIHBsYXllcnMgPSBuZXcgTWFwPG51bWJlciwgTmV0d29ya0VudGl0eT4oKTsgLy8gQ29udGFpbnMgdGhlIHBsYXllcnNcblxuXG5cbmZ1bmN0aW9uIFNldFVwVGVycmFpbihzY2VuZTogVEhSRUUuU2NlbmUpIHtcblxuICAgIGZldGNoKCcvZGlzdC9tYXAuZXNtYXAnLCB7fSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3AuYXJyYXlCdWZmZXIoKTtcbiAgICB9KS50aGVuKGFyciA9PiB7XG4gICAgICAgIHNjZW5lLmFkZChuZXcgQXJlbmFNYXAoYXJyKSlcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0dXBXb3JsZChzY2VuZTogVEhSRUUuU2NlbmUpIHtcblxuICAgIFNldFVwVGVycmFpbihzY2VuZSk7XG5cbiAgICAvLyBTb21lIGxpZ2h0aW5nXG4gICAgc2NlbmUuYWRkKChuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZWVlZWVlZmYsIDB4MDgwODA4LCAxKSkpO1xuXG4gICAgc2NlbmUuYWRkKChuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4NDQ0NDQ0KSkpO1xuICAgIFxuICAgIFxuICAgIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBhbnRpYWxpYXM6IHRydWUsIGFscGhhOiBmYWxzZSB9KTtcbiAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4ODdDRUZBKTtcbiAgICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIC8vcmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyhkZXZpY2VQaXhlbFJhdGlvKTtcblxuICAgIHZhciBkaXJMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweGZmZmZmZiwgMSApO1xuICAgIGRpckxpZ2h0LnBvc2l0aW9uLnNldCggLTEsIDAuNzUsIDEgKTtcbiAgICBkaXJMaWdodC5wb3NpdGlvbi5tdWx0aXBseVNjYWxhcig1MCk7XG4gICAgLy8gZGlyTGlnaHQuc2hhZG93Q2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgZGlyTGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG5cbiAgICBzY2VuZS5hZGQoIGRpckxpZ2h0ICk7XG4gICAgXG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgLy8gV2UganVzdCBtYWtlIHN1cmUgdGhhdCB3ZSBoYXZlIDggY2hhcnMgaW4gdGhlIHVpZFxuICAgIGNvbm4gPSBuZXcgV2ViU29ja2V0KHdzSG9zdCArICcvd3M/dXVpZD0nICsgd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpKTtcbiAgICBjb25uLmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgIC8vIEluaXQgcGxheWVyXG4gICAgcGxheWVyID0gbmV3IExvY2FsUGxheWVyKGNvbm4pO1xuXG4gICAgZG9jdW1lbnQub25rZXlkb3duID0gKGUpID0+IHtcbiAgICAgICAgcGxheWVyLmtleURvd24oZSk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IChlKSA9PiB7XG4gICAgICAgIHBsYXllci5rZXlVcChlKTtcbiAgICB9XG5cbiAgICAvLyBTZXR1cCBuZXR3b3JrIGxpc3RlbmVyXG4gICAgY29ubi5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuXG4gICAgICAgIHZhciBkYXRhID0gbmV3IERhdGFWaWV3KGUuZGF0YSk7XG5cbiAgICAgICAgc3dpdGNoIChkYXRhLmdldFVpbnQ4KDApKSB7XG4gICAgICAgICAgICBjYXNlIDB4MTogLy8gY29ubmVjdGlvblxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBSZW1vdGVQbGF5ZXIoKVxuICAgICAgICAgICAgICAgIHNjZW5lLmFkZChuZXdQbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHBsYXllcnMuc2V0KGRhdGEuZ2V0VWludDgoMSksIG5ld1BsYXllcik7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMHgyOiAvLyBkZWNvbm5lY3Rpb25cblxuICAgICAgICAgICAgICAgIHNjZW5lLnJlbW92ZShwbGF5ZXJzLmdldChkYXRhLmdldFVpbnQ4KDEpKSlcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmRlbGV0ZShkYXRhLmdldFVpbnQ4KDEpKTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAweDM6IC8vIEVudGl0eSB1cGRhdGVcblxuICAgICAgICAgICAgICAgIC8vIFdlIHdvbid0IGFjY2VwdCBhbnkgdXBkYXRlIHdpdGggd2UgaGF2ZSBub3RoaW5nIHRvIHVwZGF0ZSBvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJzLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZWNlaXZlIGEgbG90IG9mIHVwZGF0ZXMgaW4gdGhlIHNhbWUgcGFja2V0XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmdldFVpbnQ4KDEpOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVGcmFtZSA9IG5ldyBEYXRhVmlldyhlLmRhdGEsIDIgKyBpICogKDMgKyA0ICogNiksICgzICsgNCAqIDYpKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXJVSUQgPSB1cGRhdGVGcmFtZS5nZXRVaW50OCgwKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJzLmhhcyhwbGF5ZXJVSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLmdldChwbGF5ZXJVSUQpLnVwZGF0ZUZyb21OZXR3b3JrKHVwZGF0ZUZyYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAweDQ6IC8vIFBsYXllcnMgbGlzdFxuXG4gICAgICAgICAgICAgICAgLy8gV2UgYWRkIHRoZSBwbGF5ZXIgdG8gdGhlIHNjZW5lXG4gICAgICAgICAgICAgICAgc2NlbmUuYWRkKHBsYXllcik7XG4gICAgICAgICAgICAgICAgLy8gV2UgYWRkIHRoZSBwbGF5ZXIgdG8gZW50aXRpZXMgbGlzdFxuICAgICAgICAgICAgICAgIHBsYXllcnMuc2V0KGRhdGEuZ2V0VWludDgoMSksIHBsYXllcik7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuYnl0ZUxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyVUlEID0gZGF0YS5nZXRVaW50OCgyICsgaSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUmVtb3RlUGxheWVyKClcbiAgICAgICAgICAgICAgICAgICAgc2NlbmUuYWRkKG5ld1BsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnMuc2V0KG5ld1BsYXllclVJRCwgbmV3UGxheWVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHNldHVwV29ybGQoc2NlbmUpO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcblxuICAgIHBsYXllci51cGRhdGUoKTtcblxuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgcGxheWVyLmNhbWVyYSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZ2FtZS50cyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCBOZXR3b3JrRW50aXR5IGZyb20gJy4vbmV0d29ya0VudGl0eSdcbmltcG9ydCBKb3lzdGlja0ludGVyZmFjZSBmcm9tICcuL2pveXN0aWNrSW50ZXJmYWNlJ1xuXG5cbmV4cG9ydCBkZWZhdWx0XG4gICAgY2xhc3MgTG9jYWxQbGF5ZXIgZXh0ZW5kcyBOZXR3b3JrRW50aXR5IHtcblxuICAgIHB1YmxpYyBjb25uOiBXZWJTb2NrZXQ7XG5cbiAgICBwcml2YXRlIG1hdGVyaWFsOiBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsO1xuICAgIHB1YmxpYyBjYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhO1xuICAgIHByaXZhdGUgcGxhbmU6IFRIUkVFLlNraW5uZWRNZXNoO1xuXG4gICAgcHJpdmF0ZSBqb3lzdGljazogSm95c3RpY2tJbnRlcmZhY2U7XG5cbiAgICBwcml2YXRlIHRpbWVMYXN0VXBkYXRlOiBudW1iZXIgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG5cbiAgICBwcml2YXRlIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgcGl0Y2g6IDAsXG4gICAgICAgIHJvbGw6IDAsXG4gICAgICAgIHlhdzogMCxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBrZXlNYXBwaW5nID0ge1xuICAgICAgICByb2xsVXA6IDY1LCAvLyBBXG4gICAgICAgIHJvbGxEb3duOiA2OCwgLy8gRFxuICAgICAgICBwaXRjaFVwOiA4NywgLy8gU1xuICAgICAgICBwaXRjaERvd246IDgzLCAvLyBXIFxuICAgICAgICB5YXdVcDogMzcsIC8vIEFycm93IExlZnRcbiAgICAgICAgeWF3RG93bjogMzksIC8vIEFycm93IFJpZ2h0XG4gICAgICAgIHRocnVzdFVwOiAzMiAvLyBTcGFjZSBiYXJlXG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0aHJ1c3QgPSAwO1xuXG5cbiAgICBjb25zdHJ1Y3Rvcihjb25uOiBXZWJTb2NrZXQpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuY29ubiA9IGNvbm47XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoOTAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCA1MDAwMDApO1xuXG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSAzO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gLTEwO1xuXG4gICAgICAgIHRoaXMuY2FtZXJhLnJvdGF0aW9uLnkgPSAtTWF0aC5QSTtcbiAgICAgICAgLy90aGlzLmNhbWVyYS5yb3RhdGlvbi54ID0gTWF0aC5QSSAvIDU7XG5cbiAgICAgICAgdGhpcy5hZGQodGhpcy5jYW1lcmEpO1xuXG4gICAgICAgIHZhciBqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblxuICAgICAgICBqc29uTG9hZGVyLmxvYWQoJ2Rpc3QvcHJvdG9wbGFuZS5qc29uJywgKGdlb21ldHJ5OiBUSFJFRS5HZW9tZXRyeSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHgwODViMDh9KTtcblxuICAgICAgICAgICAgdGhpcy5wbGFuZSA9IG5ldyBUSFJFRS5Ta2lubmVkTWVzaChnZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGxhbmUuc2NhbGUuc2V0KDAuMDA1LDAuMDA1LDAuMDA1KTtcblxuICAgICAgICAgICAgdGhpcy5hZGQodGhpcy5wbGFuZSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5qb3lzdGljayA9IG5ldyBKb3lzdGlja0ludGVyZmFjZSgpO1xuXG5cblxuICAgIH1cblxuXG4gICAga2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgLy8gUk9MTFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IHRoaXMua2V5TWFwcGluZy5yb2xsVXAgJiYgdGhpcy5kaXJlY3Rpb24ucGl0Y2ggPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ucm9sbCA9IDEyNztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gdGhpcy5rZXlNYXBwaW5nLnJvbGxEb3duICYmIHRoaXMuZGlyZWN0aW9uLnBpdGNoID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnJvbGwgPSAtMTI3O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUElUQ0hcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSB0aGlzLmtleU1hcHBpbmcucGl0Y2hVcCAmJiB0aGlzLmRpcmVjdGlvbi5waXRjaCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5waXRjaCA9IDEyNztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gdGhpcy5rZXlNYXBwaW5nLnBpdGNoRG93biAmJiB0aGlzLmRpcmVjdGlvbi5waXRjaCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5waXRjaCA9IC0xMjc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBZQVdcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSB0aGlzLmtleU1hcHBpbmcueWF3VXAgJiYgdGhpcy5kaXJlY3Rpb24ueWF3ID09IDApIHsgLy8gYVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueWF3ID0gMTI3O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSB0aGlzLmtleU1hcHBpbmcueWF3RG93biAmJiB0aGlzLmRpcmVjdGlvbi55YXcgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueWF3ID0gLTEyNztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRIUlVTVFxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IHRoaXMua2V5TWFwcGluZy50aHJ1c3RVcCAmJiB0aGlzLnRocnVzdCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnRocnVzdCA9IDI1NTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAga2V5VXAoZTogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG5cbiAgICAgICAgICAgIC8vIFJPTExcbiAgICAgICAgICAgIGNhc2UgdGhpcy5rZXlNYXBwaW5nLnJvbGxVcDpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5yb2xsID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdGhpcy5rZXlNYXBwaW5nLnJvbGxEb3duOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnJvbGwgPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvLyBQSVRDSFxuICAgICAgICAgICAgY2FzZSB0aGlzLmtleU1hcHBpbmcucGl0Y2hVcDpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5waXRjaCA9IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMua2V5TWFwcGluZy5waXRjaERvd246XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ucGl0Y2ggPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvLyBZQVdcbiAgICAgICAgICAgIGNhc2UgdGhpcy5rZXlNYXBwaW5nLnlhd1VwOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnlhdyA9IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMua2V5TWFwcGluZy55YXdEb3duOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnlhdyA9IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIC8vIFRIUlVTVFxuICAgICAgICAgICAgY2FzZSB0aGlzLmtleU1hcHBpbmcudGhydXN0VXA6XG4gICAgICAgICAgICAgICAgdGhpcy50aHJ1c3QgPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHVwZGF0ZU5ldHdvcmsoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuY29ubi5yZWFkeVN0YXRlICE9IDEpIHsgLy8gV2UgZG9uJ3Qgd2FudCB0byB0cmFuc21pdFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXRlID0gbmV3IEFycmF5QnVmZmVyKDUpO1xuICAgICAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhzdGF0ZSk7XG5cbiAgICAgICAgdmlldy5zZXRVaW50OCgwLCAweDMpOyAvLyAweDMgaXMgdGhlIGluc3RydWN0aW9uIG51bWJlciBmb3IgXCJtb3ZlIGVudGl0eVwiXG5cbiAgICAgICAgdmlldy5zZXRJbnQ4KDEsIHRoaXMuZGlyZWN0aW9uLnJvbGwpO1xuICAgICAgICB2aWV3LnNldEludDgoMiwgdGhpcy5kaXJlY3Rpb24ucGl0Y2gpO1xuICAgICAgICB2aWV3LnNldEludDgoMywgdGhpcy5kaXJlY3Rpb24ueWF3KTtcbiAgICAgICAgdmlldy5zZXRVaW50OCg0LCB0aGlzLnRocnVzdCk7XG5cblxuICAgICAgICB0aGlzLmNvbm4uc2VuZCh2aWV3LmJ1ZmZlcik7XG5cbiAgICB9XG5cblxuICAgIHVwZGF0ZSgpIHtcblxuICAgICAgICAvLyBHYW1lcGFkIGxvZ2ljIGhlcmUuLi5cbiAgICAgICAgdGhpcy5qb3lzdGljay51cGRhdGUoKGlucHV0cykgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnRocnVzdCA9IGlucHV0cy50aHJ1c3QgKiAyNTU7XG5cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnJvbGwgPSBpbnB1dHMucm9sbCAqIDEyNztcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnBpdGNoID0gaW5wdXRzLnBpdGNoICogMTI3O1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueWF3ID0gaW5wdXRzLnlhdyAqIDEyNztcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU5ldHdvcmsoKTtcblxuICAgIH1cblxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9sb2NhbFBsYXllci50cyIsIlxuaW50ZXJmYWNlIElKb3lzdGlja01hcCB7XG4gICAgdGhydXN0QXhpczogSm95c3RpY2tNYXBwZWRBeGlzO1xuICAgIHJvbGxBeGlzOiBKb3lzdGlja01hcHBlZEF4aXM7XG4gICAgcGl0Y2hBeGlzOiBKb3lzdGlja01hcHBlZEF4aXM7XG4gICAgeWF3QXhpczogSm95c3RpY2tNYXBwZWRBeGlzO1xuICAgIGZpcmVCdXR0b246IG51bWJlcjtcbiAgICB0YWxrQnV0dG9uOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBKb3lzdGlja1ZhbHVlcyB7XG4gICAgdGhydXN0OiBudW1iZXI7IC8vIEZyb20gMC4wIHRvIDEuMFxuXG4gICAgcm9sbDogbnVtYmVyOyAvLyBGcm9tIDAuMCB0byAxLjBcbiAgICBwaXRjaDogbnVtYmVyOyAvLyBGcm9tIDAuMCB0byAxLjBcbiAgICB5YXc6IG51bWJlcjsgLy8gRnJvbSAwLjAgdG8gMS4wXG5cbiAgICBmaXJlUHVzaGVkOiBib29sZWFuO1xuICAgIHRhbGtQdXNoZWQ6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBKb3lzdGlja01hcHBlZEF4aXMge1xuICAgIGluZGV4OiBudW1iZXI7XG4gICAgbWluOiBudW1iZXI7XG4gICAgbWF4OiBudW1iZXI7XG4gICAgcmFuZ2U6IG51bWJlclxuICAgIG11bDogbnVtYmVyO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0XG4gICAgY2xhc3MgSm95c3RpY2tJbnRlcmZhY2Uge1xuXG4gICAgcHJpdmF0ZSBjdXJyZW50SW5kZXg6IG51bWJlciA9IDE7XG4gICAgcHJpdmF0ZSBtYXA6IElKb3lzdGlja01hcCA9IHtcbiAgICAgICAgdGhydXN0QXhpczoge1xuICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDAsXG4gICAgICAgICAgICByYW5nZTogMCxcbiAgICAgICAgICAgIG11bDogMCxcbiAgICAgICAgfSxcbiAgICAgICAgcm9sbEF4aXM6IHtcbiAgICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAwLFxuICAgICAgICAgICAgcmFuZ2U6IDAsXG4gICAgICAgICAgICBtdWw6IDAsXG4gICAgICAgIH0sXG4gICAgICAgIHBpdGNoQXhpczoge1xuICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDAsXG4gICAgICAgICAgICByYW5nZTogMCxcbiAgICAgICAgICAgIG11bDogMCxcbiAgICAgICAgfSxcbiAgICAgICAgeWF3QXhpczoge1xuICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDAsXG4gICAgICAgICAgICByYW5nZTogMCxcbiAgICAgICAgICAgIG11bDogMCxcbiAgICAgICAgfSxcbiAgICAgICAgZmlyZUJ1dHRvbjogMCxcbiAgICAgICAgdGFsa0J1dHRvbjogMFxuICAgIH07XG5cbiAgICBwcml2YXRlIGNvbm5lY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJnYW1lcGFkY29ubmVjdGVkXCIsIChlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdChlLmdhbWVwYWQuaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImdhbWVwYWRkaXNjb25uZWN0ZWRcIiwgKGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QoMCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGlzRGV2aWNlS25vdyhkZXZpY2VJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnam95c3RpY2s6JyArIGRldmljZUlkKSAhPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSB2YXJpYXRpbmcgYXhpcy4gUmV0dXJucyAtMSBpZiBub3RoaW5nIGNoYW5nZWRcbiAgICBmaW5kSW5kZXhPZlZhcmlhdGlvbihsb3c6IEFycmF5PG51bWJlcj4sIGhpZ2g6IEFycmF5PG51bWJlcj4pOiBKb3lzdGlja01hcHBlZEF4aXMge1xuXG4gICAgICAgIHZhciBheGlzID0ge1xuICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDAsXG4gICAgICAgICAgICByYW5nZTogMCxcbiAgICAgICAgICAgIG11bDogMCxcbiAgICAgICAgfSBhcyBKb3lzdGlja01hcHBlZEF4aXM7XG5cbiAgICAgICAgY29uc29sZS5sb2cobG93KTtcbiAgICAgICAgY29uc29sZS5sb2coaGlnaCk7XG5cblxuICAgICAgICBmb3IgKHZhciBpID0gbG93Lmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmIChoaWdoW2ldID09IGxvd1tpXSkgLy8gSWdub3JlIHRoZSBpZGVudGljYWxcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGhpZ2hbaV0gLSBsb3dbaV0pID49IGF4aXMucmFuZ2UpIHtcblxuICAgICAgICAgICAgICAgIGF4aXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgICAgICBtaW46IGxvd1tpXSA+IGhpZ2hbaV0gPyBoaWdoW2ldIDogbG93W2ldLFxuICAgICAgICAgICAgICAgICAgICBtYXg6IGxvd1tpXSA8IGhpZ2hbaV0gPyBoaWdoW2ldIDogbG93W2ldLFxuICAgICAgICAgICAgICAgICAgICByYW5nZTogTWF0aC5hYnMoaGlnaFtpXSkgKyBNYXRoLmFicyhsb3dbaV0pLFxuICAgICAgICAgICAgICAgICAgICBtdWw6IGxvd1tpXSA+IGhpZ2hbaV0gPyAtMSA6IDEsXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXhpcy5yYW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXhpcztcblxuICAgIH1cblxuICAgIC8vIEFsbCB0aGUgcHJvY2VkdXJlIHRvIHJlZ2lzdGVyIGEgbmV3IG1hcCAoYXhlcyBjb25maWd1cmF0aW9uKVxuICAgIHJlZ2lzdGVyTmV3TWFwKGdhbWVwYWRJbmRleDogbnVtYmVyLCBkZXZpY2VJZDogc3RyaW5nLCBjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuXG4gICAgICAgIHZhciBqb3lzdGlja01hcDogSUpveXN0aWNrTWFwID0gdGhpcy5tYXA7XG5cbiAgICAgICAgdmFyIHN0ZXAgPSAwO1xuXG4gICAgICAgIHZhciBzYW1wbGVMb3c6IEFycmF5PG51bWJlcj4gPSBbXTtcbiAgICAgICAgdmFyIHNhbXBsZUhpZ2h0OiBBcnJheTxudW1iZXI+ID0gW107XG5cbiAgICAgICAgdmFyIGludHJ1Y3Rpb246IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgaW50cnVjdGlvbi5pbm5lclRleHQgPSAnWW91IG5lZWQgdG8gcmUtbWFwIHlvdXIgam95c3RpY2suIEl0IHdpbGwgdGFrZSBhIG1vbWVudC4uLiBKdXN0IGNsaWNrIG5leHQgYW5kIGZvbGxvdyB0aGUgaW5zdHJ1Y3Rpb25zLic7IC8vIEhlcmUgY29tZSB0aGUgZmlyc3QgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWRcblxuXG4gICAgICAgIHZhciBidG5OZXh0U3RlcDogSFRNTEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnRuTmV4dFN0ZXAuc3R5bGUucGFkZGluZyA9ICcxMHB4JztcbiAgICAgICAgYnRuTmV4dFN0ZXAuc3R5bGUud2lkdGggPSAnODAlJztcbiAgICAgICAgYnRuTmV4dFN0ZXAudGV4dENvbnRlbnQgPSAnTmV4dCc7XG4gICAgICAgIGJ0bk5leHRTdGVwLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSAnYm90dG9tJztcblxuXG4gICAgICAgIHZhciBtb2RhbEJvZHk6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1vZGFsQm9keS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIG1vZGFsQm9keS5zdHlsZS50b3AgPSBtb2RhbEJvZHkuc3R5bGUucmlnaHQgPSBtb2RhbEJvZHkuc3R5bGUuYm90dG9tID0gbW9kYWxCb2R5LnN0eWxlLmxlZnQgPSAnMjBweCc7XG4gICAgICAgIG1vZGFsQm9keS5zdHlsZS56SW5kZXggPSAnMTAwJztcbiAgICAgICAgbW9kYWxCb2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOSknO1xuICAgICAgICBtb2RhbEJvZHkuc3R5bGUucGFkZGluZyA9ICc0MHB4JztcbiAgICAgICAgbW9kYWxCb2R5LnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICBtb2RhbEJvZHkuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzhweCc7XG5cbiAgICAgICAgbW9kYWxCb2R5LmFwcGVuZENoaWxkKGludHJ1Y3Rpb24pO1xuICAgICAgICBtb2RhbEJvZHkuYXBwZW5kQ2hpbGQoYnRuTmV4dFN0ZXApO1xuXG4gICAgICAgIC8vIFNldHVwIHRoZSBtb2RhbFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsQm9keSk7XG5cblxuICAgICAgICBjb25zdCBzdGVwc0ludHJ1Y3Rpb25zID0gW1xuICAgICAgICAgICAgJ1RIUlVTVCAtPiBET1dOJyxcbiAgICAgICAgICAgICdUSFJVU1QgLT4gVVAnLFxuICAgICAgICAgICAgJ1lBVyAtPiBSSUdIVCcsXG4gICAgICAgICAgICAnWUFXIC0+IExFRlQnLFxuICAgICAgICAgICAgJ1BJVENIIC0+IFVQJyxcbiAgICAgICAgICAgICdQSVRDSCAtPiBET1dOJyxcbiAgICAgICAgICAgICdST0xMIC0+IFJJR0hUJyxcbiAgICAgICAgICAgICdST0xMIC0+IExFRlQnLFxuICAgICAgICAgICAgJ0RPTkUgISBDbGljayBvbmUgbW9yZSB0aW1lIScsXG4gICAgICAgICAgICAnJ1xuICAgICAgICBdXG5cblxuICAgICAgICBidG5OZXh0U3RlcC5vbmNsaWNrID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBJbnN0cnVjdGlvbnNcbiAgICAgICAgICAgIGludHJ1Y3Rpb24uaW5uZXJUZXh0ID0gc3RlcHNJbnRydWN0aW9uc1tzdGVwXTtcblxuICAgICAgICAgICAgdmFyIGNoYW5nZWRBeGlzID0gLTE7XG5cbiAgICAgICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgICAgIHN3aXRjaCAoc3RlcCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgc3RlcCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvLyBXZSBwdXQgdGhlIGdhcyBkb3duIGZvciByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlTG93ID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKClbZ2FtZXBhZEluZGV4XS5heGVzO1xuICAgICAgICAgICAgICAgICAgICBzdGVwID0gMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvLyBXZSBwdXQgdGhlIGdhcyB1cCBmb3IgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZUhpZ2h0ID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKClbZ2FtZXBhZEluZGV4XS5heGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIGpveXN0aWNrTWFwLnRocnVzdEF4aXMgPSB0aGlzLmZpbmRJbmRleE9mVmFyaWF0aW9uKHNhbXBsZUxvdywgc2FtcGxlSGlnaHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN0ZXAgPSAzO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAzOiAvLyBXZSBwdXQgdGhlIHlhdyB1cCBmb3IgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZUxvdyA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpW2dhbWVwYWRJbmRleF0uYXhlcztcbiAgICAgICAgICAgICAgICAgICAgc3RlcCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogLy8gTGFzdCBTdGVwIDogU2F2ZSB0aGUgbWFwIGluIHRoZSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZUhpZ2h0ID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKClbZ2FtZXBhZEluZGV4XS5heGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIGpveXN0aWNrTWFwLnlhd0F4aXMgPSB0aGlzLmZpbmRJbmRleE9mVmFyaWF0aW9uKHNhbXBsZUxvdywgc2FtcGxlSGlnaHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN0ZXAgPSA1O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgNTogLy8gV2UgcHV0IHRoZSB5YXcgdXAgZm9yIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVMb3cgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVtnYW1lcGFkSW5kZXhdLmF4ZXM7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXAgPSA2O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY6IC8vIExhc3QgU3RlcCA6IFNhdmUgdGhlIG1hcCBpbiB0aGUgbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVIaWdodCA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpW2dhbWVwYWRJbmRleF0uYXhlcztcblxuICAgICAgICAgICAgICAgICAgICBqb3lzdGlja01hcC5waXRjaEF4aXMgPSB0aGlzLmZpbmRJbmRleE9mVmFyaWF0aW9uKHNhbXBsZUxvdywgc2FtcGxlSGlnaHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN0ZXAgPSA3O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgNzogLy8gV2UgcHV0IHRoZSB5YXcgdXAgZm9yIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVMb3cgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVtnYW1lcGFkSW5kZXhdLmF4ZXM7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXAgPSA4O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDg6IC8vIExhc3QgU3RlcCA6IFNhdmUgdGhlIG1hcCBpbiB0aGUgbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVIaWdodCA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpW2dhbWVwYWRJbmRleF0uYXhlcztcblxuICAgICAgICAgICAgICAgICAgICBqb3lzdGlja01hcC5yb2xsQXhpcyA9IHRoaXMuZmluZEluZGV4T2ZWYXJpYXRpb24oc2FtcGxlTG93LCBzYW1wbGVIaWdodCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc3RlcCA9IDk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgICAgICBzdGVwID0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTA6IC8vIExhc3QgU3RlcCA6IFNhdmUgdGhlIG1hcCBpbiB0aGUgbG9jYWwgc3RvcmFnZVxuXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqb3lzdGljazonICsgZGV2aWNlSWQsIEpTT04uc3RyaW5naWZ5KGpveXN0aWNrTWFwKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBtb2RhbFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsQm9keSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICBjb25uZWN0KGluZGV4OiBudW1iZXIpIHtcblxuICAgICAgICBjb25zdCBkZXZpY2UgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVtpbmRleF07XG5cbiAgICAgICAgY29uc3QgYXBwcm92ZSA9ICgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIHRoaXMubWFwID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnam95c3RpY2s6JyArIGRldmljZS5pZCkpO1xuXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnYW1lcGFkIGNvbm5lY3RlZCcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmlzRGV2aWNlS25vdyhkZXZpY2UuaWQpKSB7XG4gICAgICAgICAgICBhcHByb3ZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyTmV3TWFwKGluZGV4LCBkZXZpY2UuaWQsIGFwcHJvdmUpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdnYW1lcGFkIGRpc2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZShjYWxsYmFjazogKGdhbWVwYWQ6IEpveXN0aWNrVmFsdWVzKSA9PiB2b2lkKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3RlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBkZXZpY2UgPSBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVt0aGlzLmN1cnJlbnRJbmRleF07XG5cblxuICAgICAgICAgICAgdmFyIHQgPSAoZGV2aWNlLmF4ZXNbdGhpcy5tYXAudGhydXN0QXhpcy5pbmRleF0gKiB0aGlzLm1hcC50aHJ1c3RBeGlzLm11bCArIE1hdGguYWJzKHRoaXMubWFwLnRocnVzdEF4aXMubWluKSkgLyB0aGlzLm1hcC50aHJ1c3RBeGlzLnJhbmdlLFxuICAgICAgICAgICAgICAgIHIgPSBkZXZpY2UuYXhlc1t0aGlzLm1hcC5yb2xsQXhpcy5pbmRleF0gKiB0aGlzLm1hcC5yb2xsQXhpcy5tdWwsXG4gICAgICAgICAgICAgICAgcCA9IGRldmljZS5heGVzW3RoaXMubWFwLnBpdGNoQXhpcy5pbmRleF0gKiB0aGlzLm1hcC5waXRjaEF4aXMubXVsLFxuICAgICAgICAgICAgICAgIHkgPSBkZXZpY2UuYXhlc1t0aGlzLm1hcC55YXdBeGlzLmluZGV4XSAqIHRoaXMubWFwLnlhd0F4aXMubXVsO1xuXG4gICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgdGhydXN0OiB0LFxuICAgICAgICAgICAgICAgIHJvbGw6IHIsXG4gICAgICAgICAgICAgICAgcGl0Y2g6IHAsXG4gICAgICAgICAgICAgICAgeWF3OiB5IC8gKHkgPCAwID8gLXRoaXMubWFwLnRocnVzdEF4aXMubWluIDogdGhpcy5tYXAudGhydXN0QXhpcy5tYXgpLFxuICAgICAgICAgICAgICAgIGZpcmVQdXNoZWQ6IGRldmljZS5idXR0b25zW3RoaXMubWFwLmZpcmVCdXR0b25dLnByZXNzZWQsXG4gICAgICAgICAgICAgICAgdGFsa1B1c2hlZDogZGV2aWNlLmJ1dHRvbnNbdGhpcy5tYXAudGFsa0J1dHRvbl0ucHJlc3NlZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvam95c3RpY2tJbnRlcmZhY2UudHMiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG4gaW1wb3J0IE5ldHdvcmtFbnRpdHkgZnJvbSAnLi9uZXR3b3JrRW50aXR5J1xuXG5cbmV4cG9ydCBkZWZhdWx0XG4gICAgY2xhc3MgUmVtb3RlUGxheWVyIGV4dGVuZHMgTmV0d29ya0VudGl0eSB7XG5cbiAgICBwcml2YXRlIG1hdGVyaWFsOiBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsO1xuICAgIHByaXZhdGUgcGxhbmU6IFRIUkVFLlNraW5uZWRNZXNoO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB2YXIganNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cbiAgICAgICAganNvbkxvYWRlci5sb2FkKCdkaXN0L3Byb3RvcGxhbmUuanNvbicsIChnZW9tZXRyeTogVEhSRUUuR2VvbWV0cnkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4Zjg0YjA4fSk7XG5cbiAgICAgICAgICAgIHRoaXMucGxhbmUgPSBuZXcgVEhSRUUuU2tpbm5lZE1lc2goZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAxMDA7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnogPSAzMDA7XG5cbiAgICAgICAgICAgIHRoaXMucGxhbmUuc2NhbGUuc2V0KDAuMDA1LDAuMDA1LDAuMDA1KTtcblxuICAgICAgICAgICAgdGhpcy5hZGQodGhpcy5wbGFuZSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlbW90ZVBsYXllci50cyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcblxuZXhwb3J0IGRlZmF1bHRcbiAgICBjbGFzcyBBcmVuYU1hcCBleHRlbmRzIFRIUkVFLk1lc2gge1xuXG4gICAgY29uc3RydWN0b3Ioc291cmNlOiBBcnJheUJ1ZmZlcikge1xuXG4gICAgICAgIGNvbnNvbGUudGltZSgpXG5cbiAgICAgICAgY29uc3Qgc291cmNlVmlldyA9IG5ldyBEYXRhVmlldyhzb3VyY2UpO1xuXG4gICAgICAgIGNvbnN0IHdpZHRoID0gc291cmNlVmlldy5nZXRVaW50MTYoMCwgdHJ1ZSksXG4gICAgICAgICAgICAgIGRlcHRoID0gc291cmNlVmlldy5nZXRVaW50MTYoMiwgdHJ1ZSksXG4gICAgICAgICAgICAgIGRpc3RhbmNlID0gIHNvdXJjZVZpZXcuZ2V0RmxvYXQzMig2LCB0cnVlKTtcblxuXG4gICAgICAgIGNvbnN0IHB0cyA9IG5ldyBJbnQxNkFycmF5KHNvdXJjZSwgMiArIDIgKyAyICsgNCwgd2lkdGggKiBkZXB0aCk7XG5cbiAgICAgICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSgod2lkdGggLSAxKSAqIChkZXB0aCAtIDEpICogOSAqIDIpO1xuXG4gICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IGRlcHRoIC0gMTsgcisrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IHdpZHRoIC0gMTsgYysrKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwID0gciAqIHdpZHRoICsgYztcblxuICAgICAgICAgICAgICAgIGNvbnN0XG4gICAgICAgICAgICAgICAgICAgIFJJR0hUID0gKGMgKyAxKSAqIGRpc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICBMRUZUID0gYyAqIGRpc3RhbmNlOyAvLyBXaGVyZSBpIGlzXG5cbiAgICAgICAgICAgICAgICBjb25zdFxuICAgICAgICAgICAgICAgICAgICBVUCA9IHIgKiBkaXN0YW5jZSwgIC8vIFdoZXJlIGkgaXNcbiAgICAgICAgICAgICAgICAgICAgRE9XTiA9IChyICsgMSkgKiBkaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgIC8vICAgIDMwLS0tLS0tMlxuICAgICAgICAgICAgICAgIC8vICAgIHwgXFwgICAgIHxcbiAgICAgICAgICAgICAgICAvLyAgICB8ICAgXFwgICB8XG4gICAgICAgICAgICAgICAgLy8gICAgfCAgICAgXFwgfFxuICAgICAgICAgICAgICAgIC8vICAgIDQtLS0tLS01MVxuICAgICAgICAgICAgICAgIHZlcnRpY2VzLnNldChbXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRklSU1QgVFJJQU5HTEVcblxuICAgICAgICAgICAgICAgICAgICAvLyBVUCBMRUZUXG4gICAgICAgICAgICAgICAgICAgIExFRlQsIC8vIFhcbiAgICAgICAgICAgICAgICAgICAgcHRzW3BdLCAvLyBZXG4gICAgICAgICAgICAgICAgICAgIFVQLCAvLyBaXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRE9XTiBSSUdIVFxuICAgICAgICAgICAgICAgICAgICBSSUdIVCwgLy8gWFxuICAgICAgICAgICAgICAgICAgICBwdHNbcCArIHdpZHRoICsgMV0sIC8vIFlcbiAgICAgICAgICAgICAgICAgICAgRE9XTiwgLy8gWlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFVQIFJJR0hUXG4gICAgICAgICAgICAgICAgICAgIFJJR0hULCAvLyBYXG4gICAgICAgICAgICAgICAgICAgIHB0c1twICsgMV0sIC8vIFlcbiAgICAgICAgICAgICAgICAgICAgVVAsIC8vIFpcblxuICAgICAgICAgICAgICAgICAgICAvLyBTRUNPTkQgVFJJQU5HTEVcblxuICAgICAgICAgICAgICAgICAgICAvLyBVUCBMRUZUXG4gICAgICAgICAgICAgICAgICAgIExFRlQsIC8vIFhcbiAgICAgICAgICAgICAgICAgICAgcHRzW3BdLCAvLyBZXG4gICAgICAgICAgICAgICAgICAgIFVQLCAvLyBaXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRE9XTiBMRUZUXG4gICAgICAgICAgICAgICAgICAgIExFRlQsIC8vIFhcbiAgICAgICAgICAgICAgICAgICAgcHRzW3AgKyB3aWR0aF0sIC8vIFlcbiAgICAgICAgICAgICAgICAgICAgRE9XTiwgLy8gWlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIERPV04gUklHSFRcbiAgICAgICAgICAgICAgICAgICAgUklHSFQsIC8vIFhcbiAgICAgICAgICAgICAgICAgICAgcHRzW3AgKyB3aWR0aCArIDFdLCAvLyBZXG4gICAgICAgICAgICAgICAgICAgIERPV04sIC8vIFpcblxuICAgICAgICAgICAgICAgIF0sIGkgKiA5ICogMik7XG5cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcblxuICAgICAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpO1xuICAgICAgICBnZW9tZXRyeS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuXG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4MjIyMjIyIH0pO1xuXG4gICAgICAgIFxuICAgICAgICBzdXBlcihnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS50aW1lRW5kKClcblxuICAgIH1cblxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcmVuYU1hcC50cyJdLCJzb3VyY2VSb290IjoiIn0=