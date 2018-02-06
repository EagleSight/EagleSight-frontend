import * as THREE from 'three';

export default
class NetworkEntity extends THREE.Object3D {

    private lastTick: number;

    constructor() {
        super();

        this.lastTick = 0;

        this.matrixAutoUpdate = false;        

        this.rotation.order = 'YZX';
    }

    updateFromNetwork(data: DataView) {
                
        this.position.set(data.getFloat32(3), data.getFloat32(7), data.getFloat32(11));
        this.rotation.set(data.getFloat32(15), data.getFloat32(19), data.getFloat32(23));

        this.updateMatrix();

    }

}