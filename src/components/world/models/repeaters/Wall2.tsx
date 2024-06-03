import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "../../../../../assets/models/wall2.glb"

useGLTF.preload(model)

export default function Wall2() {
    const { nodes }: { nodes: any } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group
            dispose={null} 
        >
            <mesh
                geometry={nodes.wall2.geometry}
                material={materials.buildingBase}
            /> 
        </group>
    )
}