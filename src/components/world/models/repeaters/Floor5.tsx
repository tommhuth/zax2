import model from "@assets/models/floor5.glb"
import { useStore } from "@data/store"
import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"

useGLTF.preload(model)

export default function Floor5() {
    const { nodes } = useGLTF(model) as GLTFModel<["floor5_1", "floor5_2", "floor5_3"]>
    const materials = useStore(i => i.materials) 

    return (
        <group dispose={null}>
            {/* cylinders */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_1.geometry}
                material={materials.floorBase}
            />

            {/* cylinders hi */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_2.geometry}
                material={materials.floorHi}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.floor5_3.geometry}
                material={materials.floorBase}
            />
        </group>
    )
}