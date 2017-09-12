import * as THREE from 'three';
import Player from './player'


var scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;

var player: Player;;

var geometry: THREE.BoxGeometry,
    mesh: THREE.Mesh;

var conn: WebSocket;

export function init() {

    conn = new WebSocket('ws://127.0.0.1:8000/ws');
    conn.binaryType = 'arraybuffer';

    scene = new THREE.Scene();

    // We add the player to the scene
    player = new Player(conn);
    scene.add(player);

    document.onkeydown = (e) => {
        player.keyDown(e);
    } 

    document.onkeyup = (e) => {
        player.keyUp(e);
    } 

    // Here comes the cubes carpet
    geometry = new THREE.BoxGeometry(200, 200, 200);
    
    const d = 4000;
    const root = 50;
    
    for (var i = 0; i < root * root; i++) {
        
        var material = new THREE.MeshBasicMaterial({ color:  Math.random() * 0x888888 + 0x777777});

        mesh = new THREE.Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;

        mesh.position.x = Math.floor(i/root) * d;
        mesh.position.z = (i % root) * -d;

        mesh.updateMatrix();

        scene.add(mesh);
    }

    // Some lighting
    scene.add((new THREE.HemisphereLight(0xccccff, 0x080808, 1)));

    scene.add((new THREE.AmbientLight( 0xffffff )));

    // Setup network listener
    conn.onmessage = (e) => {

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

    setInterval(() => {
        player.update();
    }, 1000/60)
}



export function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, player.camera);
}
