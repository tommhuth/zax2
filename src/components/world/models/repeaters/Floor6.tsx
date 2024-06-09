import * as THREE from "three"
import { useGLTF } from "@react-three/drei"
import { GLTF } from "three-stdlib"
import { useStore } from "@data/store"

import model from "@assets/models/floor6.glb"

type GLTFResult = GLTF & {
    nodes: {
        floor6: THREE.Mesh
    }
}

export default function Floor6(props: JSX.IntrinsicElements["group"]) {
    const { nodes } = useGLTF(model) as GLTFResult
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor6.geometry}
                material={materials.floorRock}
                position={[0,0,0]}
            />
        </group>
    )
}