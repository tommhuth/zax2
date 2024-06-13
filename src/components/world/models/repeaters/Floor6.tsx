import { useGLTF } from "@react-three/drei"
import { useStore } from "@data/store"

import model from "@assets/models/floor6.glb"
import { GLTFModel } from "src/types"

export default function Floor6(props: JSX.IntrinsicElements["group"]) {
    const { nodes } = useGLTF(model) as GLTFModel<["floor6"]>
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor6.geometry}
                material={materials.rock}
                position={[0, 0, 0]}
            />
        </group>
    )
}