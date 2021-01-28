import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSpring } from "react-spring";
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { Mesh, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useDebouncedCallback } from 'use-debounce';

const loader = new OBJLoader();

function useModel(name: string) {
    const [model, setModel] = useState<Object3D>();

    const path = require(`../assets/object/${name}.obj`).default

    useEffect(() => {
        loader.loadAsync(path)
            .then(m => setModel(m))
            .catch(e => console.error(e));
    }, [path])

    return model;
}

extend({ OrbitControls })

const INITIAL = {
    pos: [
        -5.7410315329449535,
        -3.46659086468632,
        -9.042776520443246
    ],
    quat: [
        -0.11731762862289866,
        0.8788996300839971,
        -0.28058553458730234,
        -0.3674830227818292
    ],
    target: [
        1.0496749711071243,
        3.3160550932734916,
        -2.3418535461885215
    ]
}

function usePolygon(points: number, rand = 0) {
    return useMemo(() => {
        const xy = new Array(points).fill(null).map((_, i) => {
            const radius = 1 - (Math.random() * Math.abs(rand))
            const offset = Math.random() * rand
            return [Math.sin, Math.cos]
                .map(fn => fn((i / points + offset) * Math.PI * 2))
                .map(v => v * radius)
                .map(v => (v + 1) / 2 * 100)
        })
        return `polygon(${xy.map(([x, y]) => `${x}% ${y}%`).join()})`
    }, [points, rand]);
}

const TriangleCanvas = () => {
    const div = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(20)
    const [animating, setAnimating] = useState(true);
    const [mouseDown, setMouseDown] = useState(false)
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        if (!mouseDown && !hovered) setAnimating(true)
    }, [mouseDown, hovered])

    const updateZoom = useDebouncedCallback(() => setZoom((div.current?.offsetHeight ?? 500) / 25), 100)

    useEffect(() => {
        window.addEventListener('resize', updateZoom.callback)
        return () => window.removeEventListener('resize', updateZoom.callback)
    })

    useEffect(() => {
        const sub = () => setMouseDown(false)
        window.addEventListener('mouseup', sub)
        return () => window.removeEventListener('mouseup', sub)
    })

    const clipPath = usePolygon(6, 0.1)

    return <div ref={div}
        className='triangle' style={{ clipPath }}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        onMouseDown={() => setMouseDown(true)}>
        <Canvas orthographic camera={{ zoom }}>
            <ambientLight />
            <pointLight position={[5, -10, 8]} />
            <Triangle />
            <Controls zoom={zoom} animating={animating} onAnimated={() => setAnimating(false)} />
        </Canvas>
    </div>
}

const Controls = (props: { animating: boolean, zoom: number, onAnimated: () => void }) => {
    const { zoom, animating, onAnimated } = props
    const { camera, gl } = useThree()
    const controls = useRef<OrbitControls>()

    useFrame(() => controls.current?.update());

    useEffect(() => {
        camera.zoom = zoom
        camera.updateProjectionMatrix()
    }, [zoom, camera])

    const fromCurrent = () => {
        const { position, quaternion } = camera
        if (!controls.current || !position || !quaternion) return INITIAL
        const { target } = controls.current
        return {
            pos: [position.x, position.y, position.z],
            quat: [quaternion.x, quaternion.y, quaternion.z, camera.quaternion.w],
            target: [target.x, target.y, target.z],
        }
    }

    const [{ pos, quat, target }, set] = useSpring(() => INITIAL);

    useFrame(() => {
        if (camera && controls.current) {
            if (animating) {
                camera.position.set(...(pos.get() as [number, number, number]))
                camera.quaternion.set(...(quat.get() as [number, number, number, number]))
                controls.current.target.set(...(target.get() as [number, number, number]))
                controls.current.update()
            } else {
                set(fromCurrent())
            }
        }
    });

    useEffect(() => {
        if (animating) set(INITIAL).then(() => window.setTimeout(onAnimated, 100))
    }, [animating, set])

    //@ts-ignore
    return <orbitControls
        enabled={!animating}
        enableZoom={false}
        enablePan={false}
        ref={controls}
        args={[camera, gl.domElement]}
        rotateSpeed={0.5}
    />
}

const Triangle = () => {
    const ref = useRef<Mesh>();
    const [hovered, setHover] = useState(false)

    const model = useModel('triangle');
    if (!model) return null;

    const [triangle] = model.children as [Mesh];

    return <mesh {...{ ref }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        args={[triangle.geometry]}>
        <meshStandardMaterial attach='material' color={hovered ? '#ff69b4' : '#ffa500'} />
    </mesh>
}

export default TriangleCanvas;