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

        this.rotation.set(data.getFloat32(5), data.getFloat32(9), data.getFloat32(13))

        this.position.x = data.getFloat32(17);
        this.position.y = data.getFloat32(21);
        this.position.z = data.getFloat32(25);        

        this.updateMatrix();
    }

}