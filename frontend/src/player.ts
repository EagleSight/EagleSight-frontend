import * as THREE from 'three';


export default
    class Player extends THREE.Object3D {

    private material: THREE.MeshLambertMaterial;

    public camera: THREE.PerspectiveCamera;
    private plane: THREE.Mesh;

    private conn: WebSocket;

    private direction = {
        left: false,
        right: false,
        forward: false
    };

    private speed = 200;

    constructor(conn: WebSocket) {
        super();

        this.conn = conn;

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100000);

        this.camera.position.y = 1300;
        this.camera.position.z = -1000;

        this.camera.rotation.y = -Math.PI;
        this.camera.rotation.x = Math.PI / 5;

        this.add(this.camera);

        var jsonLoader = new THREE.JSONLoader();

        var textureLoader = new THREE.TextureLoader();

        // Load the texture before
        textureLoader.load('dist/zero_color.png', (texture: THREE.Texture) => {

            jsonLoader.load('dist/zero.json', (geometry: THREE.Geometry) => {

                this.material = new THREE.MeshLambertMaterial({ color: 0x3A9D23, map: texture });

                this.plane = new THREE.Mesh(geometry, this.material);

                //this.plane.rotateX(-Math.PI / 2);
                this.plane.scale.multiplyScalar(0.2);
                this.plane.position.y = 500;

                this.add(this.plane);


            });

        }
        );

        this.matrixAutoUpdate = false;

    }

    keyDown(e: KeyboardEvent) {

        if (e.key == 'd' && !this.direction.right)
            this.direction.right = true;

        if (e.key == 'a' && !this.direction.left)
            this.direction.left = true;

        if (e.key == 'w' && !this.direction.forward)
            this.direction.forward = true;

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

    updateNetwork() {

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

    }

    updateFromNetwork(data: DataView) {

        this.rotation.x = data.getFloat32(5);
        this.rotation.y = data.getFloat32(9);
        this.rotation.z = data.getFloat32(13);

        this.position.x = data.getFloat32(17);
        this.position.y = data.getFloat32(21);
        this.position.z = data.getFloat32(25);

        this.updateMatrix();
    }
}