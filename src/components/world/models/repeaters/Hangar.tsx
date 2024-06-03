import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

import model from "../../../../../assets/models/hangar.glb"

export default function Hangar() {
    const { nodes } = useGLTF(model)
    let materials = useStore(i => i.materials)  

    return (
        <group dispose={null}>
            <mesh
                receiveShadow 
                geometry={nodes.hangar_1.geometry}
                material={materials.buildingBase}
            />
            <mesh
                receiveShadow
                geometry={nodes.hangar_2.geometry}
                material={materials.buildingDark} 
            />
        </group>
    )
}