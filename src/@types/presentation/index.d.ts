import { ReactThreeFiber } from "react-three-fiber";
import { ConvexBufferGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            convexBufferGeometry: ReactThreeFiber.BufferGeometryNode<ConvexBufferGeometry, typeof ConvexBufferGeometry>;
            orbitControls: ReactThreeFiber.BufferGeometryNode<OrbitControls, typeof OrbitControls>;
        }
    }
}