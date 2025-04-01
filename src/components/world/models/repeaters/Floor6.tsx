import model from "@assets/models/floor6.glb"
import { MeshRetroMaterial } from "@components/world/materials/MeshRetroMaterial"
import { useStore } from "@data/store"
import { glsl } from "@data/utils"
import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"

export default function Floor6() {
    const { nodes } = useGLTF(model) as GLTFModel<["Plane002", "Plane002_1"]>
    const materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane002.geometry}
                material={materials.floorRock}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane002_1.geometry}
                material={materials.floorBase}
            />
        </group>
    )
}