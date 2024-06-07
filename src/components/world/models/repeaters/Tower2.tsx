import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/tower2.glb" 

export default function Tower2() {
    const { nodes }: { nodes: any } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                geometry={nodes.tower2_1.geometry}
                material={materials.buildingBase}
            />
            <mesh
                geometry={nodes.tower2_2.geometry}
                material={materials.buildingDark}
            /> 
            <mesh
                geometry={nodes.tower2_3.geometry}
                material={materials.buildingHi}
            /> 
        </group>
    )
}