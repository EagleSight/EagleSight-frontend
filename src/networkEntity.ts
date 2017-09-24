import * as THREE from 'three';

export default
class NetworkEntity extends THREE.Object3D {

    public uid: number;

    constructor(uid: number) {
        super();

        this.uid = uid;

        this.matrixAutoUpdate = false;        
    }

    updateFromNetwork(data: DataView) {

        this.rotation.set(data.getFloat32(4), data.getFloat32(8), data.getFloat32(12));
        this.position.set(data.getFloat32(16), data.getFloat32(20), data.getFloat32(24));

        this.updateMatrix();
    }

}