import * as THREE from 'three';
import LocalPlayer from './localPlayer'
import RemotePlayer from './remotePlayer'
import NetworkEntity from './NetworkEntity'


var scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;

var player: LocalPlayer;;

var geometry: THREE.BoxGeometry,
    mesh: THREE.Mesh;

var conn: WebSocket;

function generateTerrain(scene: THREE.Scene) {

    // Here comes the cubes carpet
    geometry = new THREE.BoxGeometry(200, 200, 200);

    const d = 4000;
    const root = 50;

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

function setupWorld(scene: THREE.Scene) {


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

function generateUID(): number {
    return Math.floor(Math.random() * 0xffffffff);
}

var players = new Map<number, NetworkEntity>(); // Contains the 

export function init() {

    const uid = generateUID();

    console.log(uid);


    // We just make sure that we have 8 chars in the uid
    conn = new WebSocket('ws://127.0.0.1:8000/ws?uid=' + uid.toString());
    conn.binaryType = 'arraybuffer';

    scene = new THREE.Scene();

    // We add the player to the scene
    player = new LocalPlayer(uid, conn);
    scene.add(player);

    // We add the player to entities list
    players.set(player.uid, player);


    document.onkeydown = (e) => {
        player.keyDown(e);
    }

    document.onkeyup = (e) => {
        player.keyUp(e);
    }

    // Setup network listener
    conn.onmessage = (e) => {

        var view = new DataView(e.data);

        const uid = view.getUint32(1, true)

        switch (view.getUint8(0)) {
            case 0x1: // connection

                if (uid != player.uid) {
                    var newPlayer = new RemotePlayer(uid)
                    scene.add(newPlayer);
                    players.set(uid, newPlayer);
                }

                break;
            case 0x2: // deconnection
                scene.remove(players.get(uid))
                players.delete(uid);
                break;
            case 0x3: // Entiry update
                players.get(uid).updateFromNetwork(view);
                break;
            case 0x4: // Players list
                
                for (var i = 0; i < view.getUint16(1, true); i++) {
                    var newPlayerUID = view.getUint32(1 + 2 + i * 4, true);
                    var newPlayer = new RemotePlayer(newPlayerUID)
                    scene.add(newPlayer);
                    players.set(newPlayerUID, newPlayer);
                }

                break;
        }

    };

    setupWorld(scene);

}

export function animate() {
    requestAnimationFrame(animate);

    player.update();

    renderer.render(scene, player.camera);
}
