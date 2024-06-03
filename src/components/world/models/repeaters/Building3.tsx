import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Building3() {
    const { nodes } = useGLTF("/models/building3.glb") as any
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh 
                geometry={nodes.Cube003.geometry}
                material={materials.buildingBase}
            /> 
            <mesh 
                geometry={nodes.Cube003_1.geometry}
                material={materials.buildingHi}
            /> 
        </group>
    )
}