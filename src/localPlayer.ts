import * as THREE from 'three';
import NetworkEntity from './NetworkEntity'


export default
    class LocalPlayer extends NetworkEntity {

    public conn: WebSocket;

    private material: THREE.MeshLambertMaterial;
    public camera: THREE.PerspectiveCamera;
    private plane: THREE.SkinnedMesh;


    private direction = {
        left: false,
        right: false,
        forward: false
    };

    private speed = 200;

    constructor(uid: number, conn: WebSocket) {

        super(uid);

        this.conn = conn;

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 50000);

        this.camera.position.y = 1300;
        this.camera.position.z = -1000;

        this.camera.rotation.y = -Math.PI;
        this.camera.rotation.x = Math.PI / 5;

        this.add(this.camera);

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('dist/protoplane.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0x085b08, skinning: true });

            this.plane = new THREE.SkinnedMesh(geometry, this.material);

            this.plane.position.y = 500;
            this.plane.position.z = 500;

            this.add(this.plane);
        });

    }

    keyDown(e: KeyboardEvent) {

        if (e.key == 'd' && !this.direction.right) {
            this.direction.right = true;
        }

        if (e.key == 'a' && !this.direction.left) {
            this.direction.left = true;
        }

        if (e.key == 'w' && !this.direction.forward) {
            this.direction.forward = true;
        }

    }

    keyUp(e: KeyboardEvent) {

        switch (e.key) {
            case 'd':
                this.direction.right = false;
                break;
            case 'a':
                this.direction.left = false;
                break;
            case 'w':
                this.direction.forward = false;
                break
        }

    }

    updateNetwork() {

        if (this.conn.readyState != 1) { // We don't want to transmit
            console.error('No connection to transmit on')
            return;
        }

        var state = new ArrayBuffer(1 + 4 + (6 * 4));
        var view = new DataView(state);

        view.setUint8(0, 0x3); // 0x3 is the instruction number for "move entity"

        view.setUint32(1, this.uid); // The uid of the player

        view.setFloat32(5, this.rotation.x);
        view.setFloat32(9, this.rotation.y);
        view.setFloat32(13, this.rotation.z);

        view.setFloat32(17, this.position.x);
        view.setFloat32(21, this.position.y);
        view.setFloat32(25, this.position.z);


        this.conn.send(view.buffer);

    }

    update() {

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

    }

}