import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, Object3D } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const loader = new OBJLoader();

function useModel(name: string) {
    const [model, setModel] = useState<Object3D>();

    const path = useMemo(() => require(`../assets/object/${name}.obj`).default, [name])

    useEffect(() => {
        loader.loadAsync(path)
            .then(m => setModel(m))
            .catch(e => console.error(e));
    }, [path])

    return model;
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

export default Triangle;