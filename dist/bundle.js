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
var remotePlayer_1 = __webpack_require__(5);
var scene, renderer;
var player;
;
var geometry, mesh;
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
    conn = new WebSocket('ws://scenaristes.net:8000/ws?uid=' + localUID.toString());
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
                    var updateFrame = new DataView(e.data, 8 + i * (4 + 4 * 6), (4 + 4 * 6));
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
var NetworkEntity_1 = __webpack_require__(1);
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
        return _this;
    }
    LocalPlayer.prototype.keyDown = function (e) {
        if (e.key == 'd' && this.direction.yaw == 0) {
            this.direction.yaw = -127;
        }
        if (e.key == 'a' && this.direction.yaw == 0) {
            this.direction.yaw = 127;
        }
        if (e.key == 'w' && this.thrust == 0) {
            this.thrust = 255;
        }
    };
    LocalPlayer.prototype.keyUp = function (e) {
        switch (e.key) {
            case 'd':
                this.direction.yaw = 0;
                break;
            case 'a':
                this.direction.yaw = 0;
                break;
            case 'w':
                this.thrust = 0;
                break;
        }
    };
    LocalPlayer.prototype.updateNetwork = function () {
        if (this.conn.readyState != 1) {
            return;
        }
        var state = new ArrayBuffer(3);
        var view = new DataView(state);
        view.setUint8(0, 0x3); // 0x3 is the instruction number for "move entity"
        view.setInt8(1, this.direction.yaw);
        view.setUint8(2, this.thrust);
        this.conn.send(view.buffer);
    };
    LocalPlayer.prototype.update = function () {
        this.updateNetwork();
    };
    return LocalPlayer;
}(NetworkEntity_1.default));
exports.default = LocalPlayer;


/***/ }),
/* 5 */
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
var NetworkEntity_1 = __webpack_require__(1);
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
}(NetworkEntity_1.default));
exports.default = RemotePlayer;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map