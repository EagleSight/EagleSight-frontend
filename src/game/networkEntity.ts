import * as THREE from 'three';
import { Vector3, Euler, Quaternion } from 'three';

export default
class NetworkEntity extends THREE.Object3D {

    private lastUpdateFromNetwork: number;
    private networkLocation: THREE.Vector3;
    private networkRotation: THREE.Quaternion;

    constructor() {
        super();
        this.lastUpdateFromNetwork = 0;

        this.networkLocation = new Vector3();
        this.networkRotation = new Quaternion();

        this.matrixAutoUpdate = false;
    }

    public UpdateFromNetwork(data: DataView) {

        this.lastUpdateFromNetwork = performance.now();

        this.networkLocation.set(data.getFloat32(2), data.getFloat32(6), data.getFloat32(10));
        this.networkRotation = new Quaternion(data.getFloat32(14), data.getFloat32(18), data.getFloat32(22), data.getFloat32(26));
    }
    
    public Update(timestamp: number) {

        // TODO: Extrapolation based on the 3 last networkLocation & rotation

        // For now, we just copy
        this.position.copy(this.networkLocation);
        this.rotation.setFromQuaternion(this.networkRotation);

        this.updateMatrix();
    }

}