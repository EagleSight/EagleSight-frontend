import * as THREE from 'three';
import LocalPlayer from './localPlayer'
import RemotePlayer from './remotePlayer'
import NetworkEntity from './networkEntity'
import ArenaMap from './arenaMap'

var scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;

var player: LocalPlayer;

var geometry: THREE.BoxGeometry,
    mesh: THREE.Mesh;

const wsHost = 'ws://' + window.location.hostname + ':8000';
var conn: WebSocket;

var players = new Map<number, NetworkEntity>(); // Contains the players



function SetUpTerrain(scene: THREE.Scene) {

    fetch('/dist/map.esmap', {}).then(resp => {
        return resp.arrayBuffer();
    }).then(arr => {
        scene.add(new ArenaMap(arr))
    });
}

function setupWorld(scene: THREE.Scene) {

    SetUpTerrain(scene);

    // Some lighting
    scene.add((new THREE.HemisphereLight(0xeeeeeeff, 0x080808, 1)));

    scene.add((new THREE.AmbientLight(0x444444)));
    
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x87CEFA);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setPixelRatio(devicePixelRatio);

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( -1, 0.75, 1 );
    dirLight.position.multiplyScalar(50);
    // dirLight.shadowCameraVisible = true;
    dirLight.castShadow = true;

    scene.add( dirLight );
    

    document.body.appendChild(renderer.domElement);

}

export function init() {

    // We just make sure that we have 8 chars in the uid
    conn = new WebSocket(wsHost + '/ws?uuid=' + window.location.hash.substr(1));
    conn.binaryType = 'arraybuffer';

    scene = new THREE.Scene();

    // Init player
    player = new LocalPlayer(conn);

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

                var newPlayer = new RemotePlayer()
                scene.add(newPlayer);
                players.set(data.getUint8(1), newPlayer);

                break;
            case 0x2: // deconnection

                scene.remove(players.get(data.getUint8(1)))
                players.delete(data.getUint8(1));

                break;
            case 0x3: // Entity update

                // We won't accept any update with we have nothing to update on
                if (players.size === 0) {
                    break
                }

                // Receive a lot of updates in the same packet
                for (var i = 0; i < data.getUint8(1); i++) {

                    const updateFrame = new DataView(e.data, 2 + i * (3 + 4 * 6), (3 + 4 * 6));

                    const playerUID = updateFrame.getUint8(0);
                    
                    if (players.has(playerUID)) {
                        players.get(playerUID).updateFromNetwork(updateFrame);
                    }
                }

                break;
            case 0x4: // Players list

                // We add the player to the scene
                scene.add(player);
                // We add the player to entities list
                players.set(data.getUint8(1), player);

                for (var i = 0; i < data.byteLength - 2; i++) {
                    var newPlayerUID = data.getUint8(2 + i);
                    var newPlayer = new RemotePlayer()
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
