import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Hangar() {
    const { nodes } = useGLTF("/models/hangar.glb")
    let materials = useStore(i => i.materials) 
 

    return (
        <group dispose={null}>
            <mesh
                receiveShadow 
                geometry={nodes.Cube004.geometry}
                material={materials.buildingBase}
            />
            <mesh
                receiveShadow
                geometry={nodes.Cube004_1.geometry}
                material={materials.buildingHi} 
            />
        </group>
    )
}