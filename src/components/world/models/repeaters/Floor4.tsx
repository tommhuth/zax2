import { useGLTF } from "@react-three/drei" 
import { Mesh } from "three"
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor4.glb"

export default function Floor4() {
    const { nodes } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005"] as Mesh).geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_1"] as Mesh).geometry}
                material={materials.floorHi}
            />
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_2"] as Mesh).geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_3"] as Mesh).geometry}
                material={materials.floorMark}
            />
            <mesh
                receiveShadow
                geometry={(nodes["Combined-Shape005_4"] as Mesh).geometry}
                material={materials.floorBase}
            />
        </group>
    )
}