import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

export  default function Wall1(props) {
    const { nodes } = useGLTF("/models/wall1.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.wall1.geometry}
                material={materials.buildingBase} 
            />
        </group>
    )
}

useGLTF.preload("/models/wall1.glb")