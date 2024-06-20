import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/wall1.glb"
import { GLTFModel } from "src/types.global"

export default function Wall1(props) {
    const { nodes } = useGLTF(model) as GLTFModel<["wall1_1", "wall1_2"]>
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.wall1_2.geometry}
                material={materials.buildingDark}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.wall1_1.geometry}
                material={materials.buildingBase}
            />
        </group>
    )
}