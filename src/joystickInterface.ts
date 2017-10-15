
interface IJoystickMap {
    thrustAxis: JoystickMappedAxis;
    rollAxis: JoystickMappedAxis;
    pitchAxis: JoystickMappedAxis;
    yawAxis: JoystickMappedAxis;
    fireButton: number;
    talkButton: number;
}

interface JoystickValues {
    thrust: number; // From 0.0 to 1.0

    roll: number; // From 0.0 to 1.0
    pitch: number; // From 0.0 to 1.0
    yaw: number; // From 0.0 to 1.0

    firePushed: boolean;
    talkPushed: boolean;
}

interface JoystickMappedAxis {
    index: number;
    min: number;
    max: number;
    range: number
    mul: number;
}


export default
    class JoystickInterface {

    private currentIndex: number = 1;
    private map: IJoystickMap = {
        thrustAxis: {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        },
        rollAxis: {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        },
        pitchAxis: {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        },
        yawAxis: {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        },
        fireButton: 0,
        talkButton: 0
    };

    private connected: boolean = false;

    constructor() {

        window.addEventListener("gamepadconnected", (e: any) => {
            this.connect(e.gamepad.index);
        });

        window.addEventListener("gamepaddisconnected", (e: any) => {
            this.disconnect();
        });

        if (navigator.getGamepads()[0] != null) {
            this.connect(0);
        }

    }

    isDeviceKnow(deviceId: string): boolean {
        return localStorage.getItem('joystick:' + deviceId) != null;
    }

    // Returns the index of the variating axis. Returns -1 if nothing changed
    findIndexOfVariation(low: Array<number>, high: Array<number>): JoystickMappedAxis {

        var axis = {
            index: 0,
            min: 0,
            max: 0,
            range: 0,
            mul: 0,
        } as JoystickMappedAxis;

        console.log(low);
        console.log(high);


        for (var i = low.length; i >= 0; i--) {
            if (high[i] == low[i]) // Ignore the identical
                continue;

            if (Math.abs(high[i] - low[i]) >= axis.range) {
                console.log(i);

                axis = {
                    index: i,
                    min: low[i] > high[i] ? high[i] : low[i],
                    max: low[i] < high[i] ? high[i] : low[i],
                    range: Math.abs(high[i]) + Math.abs(low[i]),
                    mul: low[i] > high[i] ? -1 : 1,
                }

                console.log(axis.range);
            }
        }

        return axis;

    }

    // All the procedure to register a new map (axes configuration)
    registerNewMap(gamepadIndex: number, deviceId: string, callback: () => void) {

        var joystickMap: IJoystickMap = this.map;

        var step = 0;

        var sampleLow: Array<number> = [];
        var sampleHight: Array<number> = [];

        var intruction: HTMLDivElement = document.createElement('div');

        intruction.innerText = 'You need to re-map your joystick. It will take a moment... Just click next and follow the instructions.'; // Here come the first message to be displayed


        var btnNextStep: HTMLButtonElement = document.createElement('button');
        btnNextStep.style.padding = '10px';
        btnNextStep.style.width = '80%';
        btnNextStep.textContent = 'Next';
        btnNextStep.style.verticalAlign = 'bottom';


        var modalBody: HTMLDivElement = document.createElement('div');
        modalBody.style.position = 'fixed';
        modalBody.style.top = modalBody.style.right = modalBody.style.bottom = modalBody.style.left = '20px';
        modalBody.style.zIndex = '100';
        modalBody.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        modalBody.style.padding = '40px';
        modalBody.style.textAlign = 'center';
        modalBody.style.borderRadius = '8px';

        modalBody.appendChild(intruction);
        modalBody.appendChild(btnNextStep);

        // Setup the modal
        document.body.appendChild(modalBody);


        const stepsIntructions = [
            'THRUST -> DOWN',
            'THRUST -> UP',
            'YAW -> RIGHT',
            'YAW -> LEFT',
            'PITCH -> DOWN',
            'PITCH -> UP',
            'ROLL -> RIGHT',
            'ROLL -> LEFT',
            'DONE ! Click one more time!',
            ''
        ]


        btnNextStep.onclick = () => {

            // Instructions
            intruction.innerText = stepsIntructions[step];

            var changedAxis = -1;

            // Actions
            switch (step) {
                case 0:
                    step = 1;
                    break;

                case 1: // We put the gas down for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 2;
                    break;
                case 2: // We put the gas up for reference
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;

                    joystickMap.thrustAxis = this.findIndexOfVariation(sampleLow, sampleHight);

                    step = 3;

                    break;

                case 3: // We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 4;
                    break;
                case 4: // Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;

                    joystickMap.yawAxis = this.findIndexOfVariation(sampleLow, sampleHight);

                    step = 5;
                    break;

                case 5: // We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 6;
                    break;
                case 6: // Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;

                    joystickMap.pitchAxis = this.findIndexOfVariation(sampleLow, sampleHight);

                    step = 7;
                    break;

                case 7: // We put the yaw up for reference
                    sampleLow = navigator.getGamepads()[gamepadIndex].axes;
                    step = 8;
                    break;
                case 8: // Last Step : Save the map in the local storage
                    sampleHight = navigator.getGamepads()[gamepadIndex].axes;

                    joystickMap.rollAxis = this.findIndexOfVariation(sampleLow, sampleHight);

                    step = 9;
                    break;

                case 9:
                    step = 10;
                    break;
                case 10: // Last Step : Save the map in the local storage

                    localStorage.setItem('joystick:' + deviceId, JSON.stringify(joystickMap));

                    // Remove the modal
                    document.body.removeChild(modalBody);

                    callback();
                    break;
            };

        };

    }

    connect(index: number) {

        const device = navigator.getGamepads()[index];

        const approve = () => {

            this.currentIndex = index;
            this.map = JSON.parse(localStorage.getItem('joystick:' + device.id));

            this.connected = true;

            console.log('gamepad connected');
        };

        if (this.isDeviceKnow(device.id)) {
            approve();
        } else {
            this.registerNewMap(index, device.id, approve);
        }

    }

    disconnect() {
        this.currentIndex = -1;
        this.connected = false;

        console.log('gamepad disconnected');
    }

    update(callback: (gamepad: JoystickValues) => void) {
        if (this.connected) {

            const device = navigator.getGamepads()[this.currentIndex];


            var t = (device.axes[this.map.thrustAxis.index] * this.map.thrustAxis.mul + Math.abs(this.map.thrustAxis.min)) / this.map.thrustAxis.range,
                r = device.axes[this.map.rollAxis.index] * this.map.rollAxis.mul,
                p = device.axes[this.map.pitchAxis.index] * this.map.pitchAxis.mul,
                y = device.axes[this.map.yawAxis.index] * this.map.yawAxis.mul;

            callback({
                thrust: t,
                roll: r,
                pitch: r,
                yaw: y / (y < 0 ? -this.map.thrustAxis.min : this.map.thrustAxis.max),
                firePushed: device.buttons[this.map.fireButton].pressed,
                talkPushed: device.buttons[this.map.talkButton].pressed
            });

        }
    }
}