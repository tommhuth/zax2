import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor1.glb"
import { GLTFModel } from "src/types.global"

export default function Floor1() {
    const { nodes } = useGLTF(model) as GLTFModel<["Plane001", "Plane001_1"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    castShadow
                    geometry={nodes.Plane001.geometry}
                    material={materials.floorBase}
                />
                <mesh
                    receiveShadow
                    castShadow
                    geometry={nodes.Plane001_1.geometry}
                    material={materials.floorHi}
                />
            </group>
        </group>
    )
}