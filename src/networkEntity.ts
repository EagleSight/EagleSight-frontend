import * as THREE from 'three';

export default
class NetworkEntity extends THREE.Object3D {

    public uid: number;
    private lastTick: number;

    constructor(uid: number) {
        super();

        this.uid = uid;

        this.lastTick = 0;

        this.matrixAutoUpdate = false;        

        this.eulerOrder = 'YZX';
    }

    updateFromNetwork(tick: number, data: DataView) {

        if (tick <= this.lastTick) {
            return;
        }

        this.lastTick = tick;
                
        this.position.set(data.getFloat32(4), data.getFloat32(8), data.getFloat32(12));
        this.rotateY(data.getFloat32(20))
        this.rotateX(data.getFloat32(16))
        this.rotateZ(data.getFloat32(24))
        
        // TODO : Use absolute rotation
        //this.rotation.set(data.getFloat32(16), data.getFloat32(20), data.getFloat32(24));

        this.updateMatrix();

    }

}