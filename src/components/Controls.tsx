import React, { useEffect, useRef } from 'react';
import { useSpring } from 'react-spring';
import { useFrame, useThree } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default Controls;