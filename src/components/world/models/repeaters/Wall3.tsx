import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/wall3.glb"
import { GLTFModel } from "src/types.global"

export default function Wall3() {
    const { nodes } = useGLTF(model) as GLTFModel<["wall3"]>
    let materials = useStore(i => i.materials)

    return (
        <group
            dispose={null}
        >
            <mesh
                geometry={nodes.wall3.geometry}
                material={materials.buildingBase}
                receiveShadow
                castShadow
            />
        </group>
    )
}