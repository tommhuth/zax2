import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/hangar.glb"
import { GLTFModel } from "src/types.global"

export default function Hangar() {
    const { nodes } = useGLTF(model) as GLTFModel<["hangar_1", "hangar_2"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                castShadow
                geometry={nodes.hangar_1.geometry}
                material={materials.buildingBase}
            />
            <mesh
                receiveShadow
                castShadow
                geometry={nodes.hangar_2.geometry}
                material={materials.buildingDark}
            />
        </group>
    )
}