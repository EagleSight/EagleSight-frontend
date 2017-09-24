import * as THREE from 'three';
import NetworkEntity from './NetworkEntity'


export default
    class RemotePlayer extends NetworkEntity {

    private material: THREE.MeshLambertMaterial;
    private plane: THREE.SkinnedMesh;

    constructor(uid: number) {

        super(uid);

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('dist/protoplane.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0xf84b08});

            this.plane = new THREE.SkinnedMesh(geometry, this.material);

            this.plane.position.y = 500;
            this.plane.position.z = 500;

            this.add(this.plane);
        });

    }

}