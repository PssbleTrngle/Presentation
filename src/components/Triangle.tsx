import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useSpring } from "react-spring";
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { Mesh, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const loader = new OBJLoader();

type Ref<T> = MutableRefObject<T | undefined>;

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
        x: -2.002463484223795,
        y: -1.2740742574377473,
        z: -5.46988723335008,
    },
    quaternion: {
        x: -0.11634786116103753,
        y: 0.8800886367407124,
        z: -0.2805883608916731,
        w: -0.3649347043174306,
    },
    target: {
        x: 1.587445751628312,
        y: 2.326696559673186,
        z: -1.8854052130746888,
    }
}

const TriangleCanvas = () => {
    const controls = useRef<OrbitControls>()

    return <div className='triangle'>
        <Canvas orthographic camera={{ zoom: 40 }} style={{ background: '#333333' }}>
            <ambientLight />
            <pointLight position={[5, -10, 8]} />
            <Triangle {...{ controls }} />
            <Controls {...{ controls }} />
        </Canvas>
    </div>
}

const Controls = ({ controls }: { controls: Ref<OrbitControls> }) => {
    const { camera, gl } = useThree()
    useFrame(() => controls.current?.update());

    //@ts-ignore
    return <orbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        rotateSpeed={0.5}
    />
}

const Triangle = (props: { controls: Ref<OrbitControls> }) => {
    const { camera } = useThree();
    const ref = useRef<Mesh>();
    const [hovered, setHover] = useState(false)
    const [animating, setAnimating] = useState(false);
    const controls = props.controls.current;

    const { position, quaternion, target } = useSpring({
        ...(animating ? INITIAL : {
            position: camera.position,
            quaternion: camera.quaternion,
            target: controls?.target,
        }),
        config: {},
        onRest: () => setAnimating(false)
    }) as typeof INITIAL;

    const startAnimation = () => {
        if (controls) setAnimating(true)
    }

    useEffect(() => {
        console.log('Animate', animating)
        if (controls) controls.enabled = !animating;
    }, [controls, animating])

    useFrame(() => {
        if (camera && controls && animating) {
            camera.position.set(position.x, position.y, position.z)
            camera.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
            controls.target.set(target.x, target.y, target.z);
            controls.update();
        }
    });

    const model = useModel('triangle');
    if (!model) return null;

    const [triangle] = model.children as [Mesh];

    return <mesh {...{ ref }}
        onClick={startAnimation}
        onContextMenu={() => console.log(JSON.stringify({
            position: camera.position.clone(),
            quaternion: camera.quaternion.clone(),
            target: controls?.target?.clone(),
        }))}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        args={[triangle.geometry]}>
        <meshStandardMaterial attach='material' color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
}

export default TriangleCanvas;