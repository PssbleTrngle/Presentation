import React, { useEffect, useRef, useState } from 'react';
import { useSpring } from "react-spring";
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { Mesh, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useDebouncedCallback } from 'use-debounce';

const loader = new OBJLoader();

function useModel(name: string) {
    const [model, setModel] = useState<Object3D>();
    const path = require(`../assets/object/${name}.obj`)

    useEffect(() => {
        loader.loadAsync(path)
            .then(m => setModel(m))
            .catch(e => console.error(e));
    }, [path])

    return model;
}

extend({ OrbitControls })

const INITIAL = {
    position: {
        x: -5.7410315329449535,
        y: -3.46659086468632,
        z: -9.042776520443246
    },
    quaternion: {
        x: -0.11731762862289866,
        y: 0.8788996300839971,
        z: -0.28058553458730234,
        w: -0.3674830227818292
    },
    target: {
        x: 1.0496749711071243,
        y: 3.3160550932734916,
        z: -2.3418535461885215
    }
}

const TriangleCanvas = () => {
    const div = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(20)
    const [animating, setAnimating] = useState(true);

    const updateZoom = useDebouncedCallback(() => setZoom((div.current?.offsetHeight ?? 500) / 25), 100)

    useEffect(() => {
        window?.addEventListener('resize', updateZoom.callback)
        return () => window?.removeEventListener('resize', updateZoom.callback)
    })

    return <div className='triangle' ref={div} onPointerOut={() => setAnimating(true)} >
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

    const spring = useSpring({
        ...((animating || !controls.current) ? INITIAL : {
            ...INITIAL,
            position: camera.position,
            quaternion: camera.quaternion,
            target: controls.current.target,
        }),
        onStart: () => console.log('Start'),
        onRest: () => onAnimated()
    }) as typeof INITIAL;
    const { position, quaternion, target } = spring

    console.log(INITIAL.position, { x: position.x, y: position.y, z: position.z })

    useEffect(() => {
        console.log(animating)
        if (controls.current) controls.current.enabled = !animating;
    }, [controls, animating])

    const update = () => {
        if (controls.current) {
            camera.position.set(position.x, position.y, position.z)
            camera.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
            controls.current.target.set(target.x, target.y, target.z);
            controls.current.update();
        }
    }

    useEffect(() => {
        update()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls, camera])

    useFrame(() => {
        if (camera && controls.current && animating) update()
    });

    //@ts-ignore
    return <orbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        rotateSpeed={0.5}
    />
}

const Triangle = () => {
    const { camera } = useThree();
    const ref = useRef<Mesh>();
    const [hovered, setHover] = useState(false)

    const model = useModel('triangle');
    if (!model) return null;

    const [triangle] = model.children as [Mesh];

    return <mesh {...{ ref }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        args={[triangle.geometry]}>
        <meshStandardMaterial attach='material' color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
}

export default TriangleCanvas;