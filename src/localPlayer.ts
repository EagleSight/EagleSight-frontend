import * as THREE from 'three';
import NetworkEntity from './NetworkEntity'


export default
    class LocalPlayer extends NetworkEntity {

    public conn: WebSocket;

    private material: THREE.MeshLambertMaterial;
    public camera: THREE.PerspectiveCamera;
    private plane: THREE.SkinnedMesh;
    private gamepad: Gamepad;

    private timeLastUpdate: number = (new Date()).getTime();


    private direction = {
        yaw: 0,
        pitch: 0,
        roll: 0
    };

    private thrust = 0;
    

    constructor(uid: number, conn: WebSocket) {

        super(uid);

        this.conn = conn;

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 50000);

        this.camera.position.y = 1300;
        this.camera.position.z = -2000;

        this.camera.rotation.y = -Math.PI;
        this.camera.rotation.x = Math.PI / 5;

        this.add(this.camera);

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('dist/protoplane.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0x085b08, skinning: true });

            this.plane = new THREE.SkinnedMesh(geometry, this.material);

            this.add(this.plane);
        });


    }

    connectGamepad(gamepad: Gamepad) {
        this.gamepad = gamepad;   
    }

    disconnectGamepad() {
        this.gamepad = undefined;
    }

    keyDown(e: KeyboardEvent) {

        if (e.key == 'd' && this.direction.yaw == 0) {
            this.direction.yaw = -127;
        }

        if (e.key == 'a' && this.direction.yaw == 0) {
            this.direction.yaw = 127;
        }

        if (e.key == 'w' && this.thrust == 0) {
            this.thrust = 255;
        }

    }

    keyUp(e: KeyboardEvent) {

        switch (e.key) {
            case 'd':
                this.direction.yaw = 0;
                break;
            case 'a':
                this.direction.yaw = 0;
                break;
            case 'w':
                this.thrust = 0;
                break
        }

    }

    updateNetwork() {

        if (this.conn.readyState != 1) { // We don't want to transmit
            return;
        }

        var state = new ArrayBuffer(3);
        var view = new DataView(state);

        view.setUint8(0, 0x3); // 0x3 is the instruction number for "move entity"

        view.setInt8(1, this.direction.yaw);
        view.setUint8(2, this.thrust);


        this.conn.send(view.buffer);

    }

    gamepadUpdate() {
        
        if (this.gamepad.axes.length > 0) {
            this.direction.yaw = this.gamepad.axes[0] * 127;
        }

        if (this.gamepad.axes.length > 1) {
            this.thrust = this.gamepad.axes[2];
        }

    }

    update() {

        if (this.gamepad != undefined) {
            // Gamepad logic here...
            this.gamepadUpdate();
        }

        this.updateNetwork();

    }

}