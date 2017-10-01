import * as THREE from 'three';
import LocalPlayer from './localPlayer'
import RemotePlayer from './remotePlayer'
import NetworkEntity from './networkEntity'

var scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;

var player: LocalPlayer;;

var geometry: THREE.BoxGeometry,
    mesh: THREE.Mesh;

const wsHost = 'ws://' + window.location.hostname + ':8000';
var conn: WebSocket;

var players = new Map<number, NetworkEntity>(); // Contains the players



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


export function init() {

    const localUID = generateUID();

    // We just make sure that we have 8 chars in the uid
    conn = new WebSocket(wsHost + '/ws?uid=' + localUID.toString());
    conn.binaryType = 'arraybuffer';

    scene = new THREE.Scene();

    // We add the player to the scene
    player = new LocalPlayer(localUID, conn);
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

        var data = new DataView(e.data);

        switch (data.getUint8(0)) {
            case 0x1: // connection

                if (data.getUint32(1) != player.uid) {
                    var newPlayer = new RemotePlayer(data.getUint32(1))
                    scene.add(newPlayer);
                    players.set(newPlayer.uid, newPlayer);
                }

                break;
            case 0x2: // deconnection

                scene.remove(players.get(data.getUint32(1)))
                players.delete(data.getUint32(1));

                break;
            case 0x3: // Entiry update

                // Receive a lot of updates in the same packet
                for (var i = 0; i < data.getUint16(5); i++) {

                    const updateFrame = new DataView(e.data, 7 + i * (4 + 4 * 6), (4 + 4 * 6));

                    const playerUID = updateFrame.getUint32(0);

                    players.get(playerUID).updateFromNetwork(data.getUint32(1), updateFrame);
                }

                break;
            case 0x4: // Players list

                for (var i = 0; i < data.getUint16(1); i++) {
                    var newPlayerUID = data.getUint32(1 + 2 + i * 4);
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
