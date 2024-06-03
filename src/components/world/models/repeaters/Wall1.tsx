import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

import model from "../../../../../assets/models/wall1.glb"

useGLTF.preload(model)

export default function Wall1(props) {
    const { nodes } = useGLTF(model)
    const materials = useStore(i => i.materials) 

    return (
        <group {...props} dispose={null}> 
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.wall1_2.geometry}
                material={materials.buildingDark}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.wall1_1.geometry}
                material={materials.buildingBase}
            />
        </group>
    )
}