import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber';
import { Group, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls })

const TriangleCanvas = () => {
    return <div className='triangle'>
        <Canvas orthographic camera={{ zoom: 40 }} style={{ background: '#333333' }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Triangle />
            <Controls />
        </Canvas>
    </div>
}

const Controls = () => {
    const controls = useRef<OrbitControls>()
    const { camera, gl } = useThree()
    useFrame(() => controls.current?.update())

    //@ts-ignore
    return <orbitControls
        ref={controls} args={[camera, gl.domElement]}
        rotateSpeed={0.5}
    />
}

const Triangle = () => {
    const ref = useRef<Group>();
    const [hovered, setHover] = useState(false)

    useFrame(() => {
        const { current } = ref;
        //if (current) current.rotation.x = current.rotation.y += 0.01;
        if (current) current.rotation.x = current.rotation.y = 0.5;
    })

    return <group
        onPointerOver={(e) => setHover(true)}
        onPointerOut={(e) => setHover(false)}
        position={[0, 0, 0]}
        {...{ ref }}>
        {new Array(3).fill(null).map((_, index) =>
            <Part key={index} {...{ hovered, index }} />
        )}
    </group>
}

const Part = (props: { index: number, hovered: boolean }) => {
    const { index, hovered } = props;

    const thickness = 1;
    const length = 5 * thickness;
    const dist = length - thickness * 3;
    const l = index === 2 ? length - (thickness * 2) : length;

    const size = Array(3).fill(null).map((_, i) => (i === index) ? l : thickness) as [number, number, number];

    const position = [
        (index > 0 ? dist : 0),
        (index < 2 ? dist : 0) - (index === 0 ? 0 : length / 2),
        (index === 2 ? l / 2 : 0) - (length / 2),
    ] as [number, number, number];

    const slide = new Float32Array([
        0, 1, 1,
        1, 1, 1,
        0, 0, 1,
        1, 0, 1,
        0, 1, 0,
        1, 1, 0,
        0, 0, 0,
        1, 0, 0,
    ]);

    return <mesh {...{ position }}>
        {index === 2 &&
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attachObject={['attributes', 'position']}
                    count={slide.length / 3}
                    array={slide}
                    itemSize={3}
                />
            </bufferGeometry>
        }
        <boxBufferGeometry attach="geometry" args={size} />
        <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
    </mesh >
}

export default TriangleCanvas;