import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

export  default function Building5(props) {
    const { nodes } = useGLTF("/models/building5.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.building5.geometry}
                material={materials.buildingBase} 
            />
        </group>
    )
}

useGLTF.preload("/models/building5.glb")