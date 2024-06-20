import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor3.glb"
import { GLTFModel } from "src/types.global"

export default function Floor3() {
    const { nodes } = useGLTF(model) as GLTFModel<["floor3"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null} scale={.3}>
            <mesh
                receiveShadow
                castShadow
                geometry={nodes.floor3.geometry}
                material={materials.floorBase}
            />
        </group>
    )
}