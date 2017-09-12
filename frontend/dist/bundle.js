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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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

Object.defineProperty(exports, "__esModule", { value: true });
var Game = __webpack_require__(2);
window.onload = function (e) {
    Game.init();
    Game.animate();
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __webpack_require__(0);
var player_1 = __webpack_require__(3);
var scene, renderer;
var player;
;
var geometry, mesh;
var conn;
function init() {
    conn = new WebSocket('ws://127.0.0.1:8000/ws');
    conn.binaryType = 'arraybuffer';
    scene = new THREE.Scene();
    // We add the player to the scene
    player = new player_1.default(conn);
    scene.add(player);
    document.onkeydown = function (e) {
        player.keyDown(e);
    };
    document.onkeyup = function (e) {
        player.keyUp(e);
    };
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
    // Some lighting
    scene.add((new THREE.HemisphereLight(0xccccff, 0x080808, 1)));
    scene.add((new THREE.AmbientLight(0xffffff)));
    // Setup network listener
    conn.onmessage = function (e) {
        var view = new DataView(e.data);
        if (view.getUint8(0) == 0x3) {
            console.log(view.getFloat32(5));
            player.updateFromNetwork(view);
        }
    };
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x87CEFA);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    setInterval(function () {
        player.update();
    }, 1000 / 60);
}
exports.init = init;
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, player.camera);
}
exports.animate = animate;


/***/ }),
/* 3 */
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
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(conn) {
        var _this = _super.call(this) || this;
        _this.direction = {
            left: false,
            right: false,
            forward: false
        };
        _this.speed = 200;
        _this.conn = conn;
        _this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100000);
        _this.camera.position.y = 1300;
        _this.camera.position.z = -1000;
        _this.camera.rotation.y = -Math.PI;
        _this.camera.rotation.x = Math.PI / 5;
        _this.add(_this.camera);
        var jsonLoader = new THREE.JSONLoader();
        var textureLoader = new THREE.TextureLoader();
        // Load the texture before
        textureLoader.load('dist/zero_color.png', function (texture) {
            jsonLoader.load('dist/zero.json', function (geometry) {
                _this.material = new THREE.MeshLambertMaterial({ color: 0x3A9D23, map: texture });
                _this.plane = new THREE.Mesh(geometry, _this.material);
                //this.plane.rotateX(-Math.PI / 2);
                _this.plane.scale.multiplyScalar(0.2);
                _this.plane.position.y = 500;
                _this.add(_this.plane);
            });
        });
        _this.matrixAutoUpdate = false;
        return _this;
    }
    Player.prototype.keyDown = function (e) {
        if (e.key == 'd' && !this.direction.right)
            this.direction.right = true;
        if (e.key == 'a' && !this.direction.left)
            this.direction.left = true;
        if (e.key == 'w' && !this.direction.forward)
            this.direction.forward = true;
    };
    Player.prototype.keyUp = function (e) {
        switch (e.key) {
            case 'd':
                this.direction.right = false;
                break;
            case 'a':
                this.direction.left = false;
                break;
            case 'w':
                this.direction.forward = false;
                break;
        }
    };
    Player.prototype.update = function () {
        if (this.direction.left) {
            this.rotation.y += 0.05;
        }
        if (this.direction.right) {
            this.rotation.y -= 0.05;
        }
        if (this.direction.forward) {
            this.position.z += Math.cos(this.rotation.y) * this.speed;
            this.position.x += Math.sin(this.rotation.y) * this.speed;
        }
        this.updateNetwork();
    };
    Player.prototype.updateNetwork = function () {
        var state = new ArrayBuffer(1 + 4 + (6 * 4));
        var view = new DataView(state);
        view.setUint8(0, 0x3);
        view.setUint32(1, 0x74727362);
        view.setFloat32(5, this.rotation.x);
        view.setFloat32(9, this.rotation.y);
        view.setFloat32(13, this.rotation.z);
        view.setFloat32(17, this.position.x);
        view.setFloat32(21, this.position.y);
        view.setFloat32(25, this.position.z);
        this.conn.send(view.buffer);
    };
    Player.prototype.updateFromNetwork = function (data) {
        this.rotation.x = data.getFloat32(5);
        this.rotation.y = data.getFloat32(9);
        this.rotation.z = data.getFloat32(13);
        this.position.x = data.getFloat32(17);
        this.position.y = data.getFloat32(21);
        this.position.z = data.getFloat32(25);
        this.updateMatrix();
    };
    return Player;
}(THREE.Object3D));
exports.default = Player;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map