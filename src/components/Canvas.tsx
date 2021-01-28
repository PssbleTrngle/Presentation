import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useDebouncedCallback } from 'use-debounce';
import Controls from './Controls';
import Triangle from './Triangle';

extend({ OrbitControls })

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

const TrianglCanvas = () => {
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

export default TrianglCanvas