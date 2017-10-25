import * as THREE from 'three';

export default
    class ArenaMap extends THREE.Mesh {

    constructor(source: ArrayBuffer) {

        console.time()

        const sourceView = new DataView(source);

        const
            width = sourceView.getUint16(0, true),
            depth = sourceView.getUint16(2, true),
            distance = 30,// sourceView.getFloat32(6, true),
            map_width = width * distance,
            map_depth = depth * distance,
            centerX = map_width / 2,
            centerZ = map_depth / 2;

        console.log(width);
        console.log(depth);
        console.log(distance);

        const pts = new Int16Array(source, 2 + 2 + 2 + 4, width * depth);

        var vertices = new Float32Array((width - 1) * (depth - 1) * 9 * 2);

        var i = 0;

        for (var r = 0; r < depth - 1; r++) {
            for (var c = 0; c < width - 1; c++) {

                const p = r * width + c;

                const
                    RIGHT = (c + 1) * distance - centerX,
                    LEFT = c * distance - centerX; // Where i is

                const
                    UP = r * distance - centerZ,  // Where i is
                    DOWN = (r + 1) * distance - centerZ;

                vertices.set([
                    // UP RIGHT
                    RIGHT, // X
                    pts[p + 1], // Y
                    UP, // Z

                    // UP LEFT
                    LEFT, // X
                    pts[p], // Y
                    UP, // Z

                    // DOWN LEFT
                    LEFT, // X
                    pts[p + width], // Y
                    DOWN, // Z

                    // DOWN LEFT
                    LEFT, // X
                    pts[p + width], // Y
                    DOWN, // Z

                    // DOWN RIGHT
                    RIGHT, // X
                    pts[p + width + 1], // Y
                    DOWN, // Z

                    // UP RIGHT
                    RIGHT, // X
                    pts[p + 1], // Y
                    UP // Z
                ], i * 9 * 2);

                i++;
            }
        }

        var geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        var material = new THREE.MeshLambertMaterial({ color: 0x222222 });

        super(geometry, material);

        this.scale.multiplyScalar(3);

        console.timeEnd()

    }

}