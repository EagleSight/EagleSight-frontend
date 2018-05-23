import * as THREE from 'three';
import LocalPlayer from './localPlayer'
import RemotePlayer from './remotePlayer'
import NetworkEntity from './networkEntity'
import ArenaMap from './arenaMap'

export default class Game {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;

    private uuid: string;
    private player: LocalPlayer;
    private players: Map<number, NetworkEntity>;

    private conn: WebSocket;

    constructor(uuid: string) {
        this.uuid = uuid;
        this.players = new Map<number, NetworkEntity>(); // Contains the players

        this.scene = new THREE.Scene();
        this.renderer = this.getRenderer();

        ArenaMap.LoadIntoScene('/map.esmap', this.scene);

        this.player = new LocalPlayer();
        
        this.initEvents();
        this.initLighting();

        
        this.conn = this.initConnection();
    }

    private initEvents() {

        document.onkeydown = (e) => {
            this.player.keyDown(e);
        }

        document.onkeyup = (e) => {
            this.player.keyUp(e);
        }

    }

    private updateFromNetwork(message: ArrayBuffer) {

        var data = new DataView(message);

        switch (data.getUint8(0)) {
            case 0x1: // connection

                // Verify that it's not already in
                if (!this.players.has(data.getUint8(1))) {
                    var newPlayer = new RemotePlayer()
                    this.scene.add(newPlayer);
                    this.players.set(data.getUint8(1), newPlayer);
                }

                break;
            case 0x2: // deconnection

                this.scene.remove(this.players.get(data.getUint8(1)))
                this.players.delete(data.getUint8(1));

                break;
            case 0x3: // Entity update

                // We won't accept any update with we have nothing to update on
                if (this.players.size === 0) {
                    break
                }

                // Receive a lot of updates in the same packet
                for (var i = 0; i < Math.floor((data.byteLength - 1) / 30); i++) {

                    const updateFrame = new DataView(message, 1 + i * (2 + 7 * 4), (2 + 3 * 4 + 4 * 4));

                    const playerUID = updateFrame.getUint8(0);

                    if (this.players.has(playerUID)) {
                        this.players.get(playerUID).UpdateFromNetwork(updateFrame);
                    }
                }

                break;
            case 0x4: // Players list

                this.player.name = 'player'

                // We add the player to the scene
                this.scene.add(this.player);
                // We add the player to entities list
                this.players.set(data.getUint8(1), this.player);

                for (var i = 2; i < data.byteLength; i++) {
                    var newPlayer = new RemotePlayer()
                    newPlayer.name = 'player' + i.toString();
                    this.scene.add(newPlayer);
                    this.players.set(data.getUint8(i), newPlayer);
                }

                break;
        }
    }

    private initConnection(): WebSocket {
        var conn = new WebSocket('ws://' + window.location.hostname + ':8000' + '/ws?uuid=' + this.uuid);
        conn.binaryType = 'arraybuffer';

        // Setup network listener
        conn.onmessage = (e) => {

            this.updateFromNetwork(e.data);
        };

        return conn;
    }

    private initLighting() {
        // Some lighting
        this.scene.add((new THREE.HemisphereLight(0xeeeeeeff, 0x080808, 1)));

        this.scene.add((new THREE.AmbientLight(0x444444)));

        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(-1, 0.75, 1);
        dirLight.position.multiplyScalar(50);
        // dirLight.shadowCameraVisible = true;
        dirLight.castShadow = true;

        this.scene.add(dirLight);
    }

    private getRenderer(): THREE.WebGLRenderer {
        var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        renderer.setClearColor(0x87CEFA);
        renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.setPixelRatio(devicePixelRatio);

        document.body.appendChild(renderer.domElement);

        return renderer;
    }


    private render(timestamp: number) {
        requestAnimationFrame(this.render.bind(this));
        
        this.players.forEach(v => {
            v.Update(timestamp);
        })
        
        this.player.ProcessInput();
        this.player.SendState(this.conn);

        this.renderer.render(this.scene, this.player.camera);
    }

    public Start() {
        requestAnimationFrame(this.render.bind(this));
    }
}
