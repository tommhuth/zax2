import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor3.glb"

export default function Floor3() {
    const { nodes }: { nodes: any } = useGLTF(model)
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null} scale={.3}>
            <mesh
                receiveShadow
                geometry={nodes.floor3.geometry}
                material={materials.floorBase}
            />
        </group>
    )
}