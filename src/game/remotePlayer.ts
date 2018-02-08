import * as THREE from 'three';
 import NetworkEntity from './networkEntity'


export default
    class RemotePlayer extends NetworkEntity {

    private material: THREE.MeshLambertMaterial;
    private plane: THREE.SkinnedMesh;

    constructor() {

        super();

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('dist/protoplane.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0xf84b08});

            this.plane = new THREE.SkinnedMesh(geometry, this.material);

            this.position.y = 100;
            this.position.z = 300;

            this.plane.scale.set(0.005,0.005,0.005);

            this.add(this.plane);
        });

    }

}