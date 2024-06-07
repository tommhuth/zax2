import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "@assets/models/wall3.glb" 

export default function Wall3() {
    const { nodes }: { nodes: any } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group
            dispose={null} 
        >
            <mesh
                geometry={nodes.wall3.geometry}
                material={materials.buildingBase}
            /> 
        </group>
    )
}