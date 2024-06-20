import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/tower2.glb"
import { GLTFModel } from "src/types.global"

export default function Tower2() {
    const { nodes } = useGLTF(model) as GLTFModel<["tower2_1", "tower2_2", "tower2_3"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                geometry={nodes.tower2_1.geometry}
                material={materials.buildingBase}
                receiveShadow
                castShadow
            />
            <mesh
                geometry={nodes.tower2_2.geometry}
                material={materials.buildingDark}
                receiveShadow
                castShadow
            />
            <mesh
                geometry={nodes.tower2_3.geometry}
                material={materials.buildingHi}
                receiveShadow
                castShadow
            />
        </group>
    )
}