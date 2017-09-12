import * as THREE from 'three';


export default
    class Plane extends THREE.Object3D {

    private material: THREE.MeshLambertMaterial;
    private plane: THREE.Mesh;


    constructor() {
        super();

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('dist/zero.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0x3A9D23 });

            this.plane = new THREE.Mesh(geometry, this.material);

            this.plane.scale.multiplyScalar(0.2);
            this.plane.position.y = 500;

            this.add(this.plane);

        });

    }

}