import * as THREE from 'three';
import NetworkEntity from './networkEntity'
import JoystickInterface from './joystickInterface'


const InputMessageSize = 6;

export default
    class LocalPlayer extends NetworkEntity {

    private material: THREE.MeshLambertMaterial;
    public camera: THREE.PerspectiveCamera;
    private plane: THREE.SkinnedMesh;

    private joystick: JoystickInterface;

    private lastInputsSent: Uint8Array;

    private thrust = 0;

    private direction = {
        pitch: 0,
        roll: 0,
        yaw: 0,
    };

    private keyMapping = {
        rollUp: 65, // A
        rollDown: 68, // D
        pitchUp: 87, // S
        pitchDown: 83, // W 
        yawUp: 37, // Arrow Left
        yawDown: 39, // Arrow Right
        thrustUp: 32 // Space bare
    }

    constructor() {

        super();

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500000);

        this.camera.position.y = 3;
        this.camera.position.z = -10;

        this.camera.rotation.y = -Math.PI;
        //this.camera.rotation.x = Math.PI / 5;

        this.add(this.camera);

        var jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('/protoplane.json', (geometry: THREE.Geometry) => {

            this.material = new THREE.MeshLambertMaterial({ color: 0x085b08 });

            this.plane = new THREE.SkinnedMesh(geometry, this.material);

            this.plane.scale.set(0.005, 0.005, 0.005);

            this.add(this.plane);

        });

        this.joystick = new JoystickInterface();

        this.lastInputsSent = new Uint8Array(InputMessageSize);

    }

    keyDown(e: KeyboardEvent) {

        // ROLL
        if (e.keyCode == this.keyMapping.rollUp && this.direction.pitch == 0) {
            this.direction.roll = 127;
        }

        if (e.keyCode == this.keyMapping.rollDown && this.direction.pitch == 0) {
            this.direction.roll = -127;
        }

        // PITCH
        if (e.keyCode == this.keyMapping.pitchUp && this.direction.pitch == 0) {
            this.direction.pitch = 127;
        }

        if (e.keyCode == this.keyMapping.pitchDown && this.direction.pitch == 0) {
            this.direction.pitch = -127;
        }

        // YAW
        if (e.keyCode == this.keyMapping.yawUp && this.direction.yaw == 0) { // a
            this.direction.yaw = 127;
        }

        if (e.keyCode == this.keyMapping.yawDown && this.direction.yaw == 0) {
            this.direction.yaw = -127;
        }

        // THRUST
        if (e.keyCode == this.keyMapping.thrustUp && this.thrust == 0) {
            this.thrust = 255;
        }

    }

    keyUp(e: KeyboardEvent) {

        switch (e.keyCode) {

            // ROLL
            case this.keyMapping.rollUp:
                this.direction.roll = 0;
                break;
            case this.keyMapping.rollDown:
                this.direction.roll = 0;
                break;

            // PITCH
            case this.keyMapping.pitchUp:
                this.direction.pitch = 0;
                break;
            case this.keyMapping.pitchDown:
                this.direction.pitch = 0;
                break;

            // YAW
            case this.keyMapping.yawUp:
                this.direction.yaw = 0;
                break;
            case this.keyMapping.yawDown:
                this.direction.yaw = 0;
                break;

            // THRUST
            case this.keyMapping.thrustUp:
                this.thrust = 0;
                break
        }

    }

    public SendState(conn: WebSocket) {

        if (conn.readyState != 1) { // We don't want to transmit
            return;
        }

        var state = new ArrayBuffer(InputMessageSize);
        var view = new DataView(state);

        view.setUint8(0, 0x3); // 0x3 is the instruction number for "move entity"
        view.setInt8(1, this.direction.roll);
        view.setInt8(2, this.direction.pitch);
        view.setInt8(3, this.direction.yaw);
        view.setUint8(4, this.thrust);
        view.setUint8(5, 0); // Firing is coming here

        if (this.inputsHaveChanged(view)) {
            conn.send(view.buffer);
        }
    }

    private inputsHaveChanged(view: DataView): boolean {

        // Compare the last input sent, bytes by bytes.
        for (var i = 1; i < this.lastInputsSent.byteLength; i++) {
            if (this.lastInputsSent[i] != view.getUint8(i)) {
               this.lastInputsSent = new Uint8Array(view.buffer);
               return true;
            }
        }

        return false;
    }

    public ProcessInput() {

        // Gamepad logic here...
        this.joystick.update((inputs) => {

            this.thrust = inputs.thrust * 255;

            this.direction.roll = inputs.roll * 127;
            this.direction.pitch = inputs.pitch * 127;
            this.direction.yaw = inputs.yaw * 127;

        });

    }

}