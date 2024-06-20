import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/wall2.glb"
import { GLTFModel } from "src/types.global"

export default function Wall2() {
    const { nodes } = useGLTF(model) as GLTFModel<["wall2"]>
    let materials = useStore(i => i.materials)

    return (
        <group
            dispose={null}
        >
            <mesh
                geometry={nodes.wall2.geometry}
                material={materials.buildingBase}
                receiveShadow
                castShadow
            />
        </group>
    )
}