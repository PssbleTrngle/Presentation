import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { Euler, Group, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ConvexBufferGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import TWEEN from '@tweenjs/tween.js'

extend({ OrbitControls, ConvexBufferGeometry })

const TriangleCanvas = () => {
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const a = (d: number) => {
            TWEEN.update(d);
            requestAnimationFrame(a);
        }
        requestAnimationFrame(a);
    }, [])

    return <div className='triangle'>
        <Canvas orthographic camera={{ zoom: 40 }} style={{ height: '400px', width: '400px', background: '#EEEEEE' }}
            onMouseOver={() => setFocused(true)}
            onMouseOut={() => setFocused(false)}>
            <ambientLight />
            <pointLight position={[10, 10, 8]} />
            <Triangle />
            <Controls {...{ focused }} />
        </Canvas>
    </div>
}

const Controls = ({ focused }: { focused: boolean }) => {
    const controls = useRef<OrbitControls>()
    const { camera, gl } = useThree()

    useFrame(() => controls.current?.update())

    useEffect(() => {
        if (!focused) {
            const { x, y, z } = camera.position;
            new TWEEN.Tween({ x, y, z })
                .to({ x: 0, y: 0, z: 5 })
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(({ x, y, z }) => camera.position.set(x, y, z))
                .duration(200)
                //@ts-ignore
                .start();
        }
    }, [focused])

    return <orbitControls
        enabled enablePan enableRotate enableZoom={false}
        ref={controls} args={[camera, gl.domElement]}
        rotateSpeed={0.5}
    />
}

const Triangle = () => {
    const ref = useRef<Group>();
    const [hovered, setHover] = useState(false)

    const thickness = 1;
    const length = 5 * thickness;
    const props: PartProps = { hovered, length, thickness }

    useEffect(() => {
        ref.current?.setRotationFromEuler(new Euler(-0.55, -0.8, 0.135))
    }, [ref.current])

    return <group
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        position={[0, 0, 0]}
        {...{ ref }}>
        {new Array(3).fill(null).map((_, index) =>
            <Part key={index} {...props} {...{ index }} />
        )}
        <Piece {...props} />
    </group>
}

interface PartProps {
    hovered: boolean;
    length: number;
    thickness: number;
}

const Part = (props: { index: number } & PartProps) => {
    const { index, hovered, length, thickness } = props;

    const dist = length - thickness * 3;
    const l = index === 2 ? length - (thickness * 2) : length;

    const size = Array(3).fill(null).map((_, i) => (i === index) ? l : thickness) as [number, number, number];

    const position = [
        (index > 0 ? dist : 0),
        (index < 2 ? dist : 0) - (index === 0 ? 0 : length / 2),
        (index === 2 ? l / 2 : 0) - (length / 2),
    ] as [number, number, number];

    return <mesh {...{ position }}>
        <boxBufferGeometry attach="geometry" args={size} />
        <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
    </mesh >
}

const Piece = (props: PartProps) => {
    const { length, thickness, hovered } = props;

    const dist = length - thickness * 3;

    const slide = useMemo(() => [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 1],
        [1, 0, 0],
        [1, 1, 0],
    ].map(v => new Vector3(...v)), [thickness]);

    return <mesh position={[dist, - length / 2, thickness].map(n => n - thickness / 2) as [number, number, number]}>
        <convexBufferGeometry args={[slide]} attach="geometry" />
        <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
}

export default TriangleCanvas;