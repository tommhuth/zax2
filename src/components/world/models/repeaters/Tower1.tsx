import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/tower1.glb"
import { GLTFModel } from "src/types.global"

export default function Tower1() {
    const { nodes } = useGLTF(model) as GLTFModel<["tower1_1", "tower1_2"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                geometry={nodes.tower1_1.geometry}
                material={materials.buildingHi}
                receiveShadow
                castShadow
            />
            <mesh
                geometry={nodes.tower1_2.geometry}
                material={materials.buildingBase}
                receiveShadow
                castShadow
            />
        </group>
    )
}