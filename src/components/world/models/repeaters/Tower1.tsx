import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "../../../../../assets/models/tower1.glb"

useGLTF.preload(model)

export default function Tower1() {
    const { nodes }: { nodes: any } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                geometry={nodes.tower1_1.geometry}
                material={materials.buildingHi}
            />
            <mesh
                geometry={nodes.tower1_2.geometry}
                material={materials.buildingBase}
            /> 
        </group>
    )
}