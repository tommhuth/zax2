import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor2.glb"
import { GLTFModel } from "src/types.global"

export default function Floor2() {
    const { nodes } = useGLTF(model) as GLTFModel<["floor2"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                castShadow
                geometry={nodes.floor2.geometry}
                material={materials.floorBase}
            />
        </group>
    )
}