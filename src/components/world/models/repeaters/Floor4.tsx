import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor4.glb"
import { GLTFModel } from "src/types.global"

export default function Floor4() {
    const { nodes } = useGLTF(model) as GLTFModel<["Combined-Shape005", "Combined-Shape005_1", "Combined-Shape005_2", "Combined-Shape005_3", "Combined-Shape005_4"]>
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                castShadow
                geometry={nodes["Combined-Shape005"].geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                castShadow
                geometry={nodes["Combined-Shape005_1"].geometry}
                material={materials.floorHi}
            />
            <mesh
                receiveShadow
                castShadow
                geometry={nodes["Combined-Shape005_2"].geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                castShadow
                geometry={nodes["Combined-Shape005_3"].geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                castShadow
                geometry={nodes["Combined-Shape005_4"].geometry}
                material={materials.floorBase}
            />
        </group>
    )
}