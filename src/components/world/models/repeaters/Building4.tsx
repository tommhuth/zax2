import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../../data/store"
import model from "@assets/models/building4.glb"

export default function Building4(props) {
    const { nodes } = useGLTF(model)
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