import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"

export default function Building4(props) {
    const { nodes } = useGLTF("/models/building4.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.building4.geometry}
                material={materials.buildingBase} 
            />
        </group>
    )
}

useGLTF.preload("/models/building4.glb")