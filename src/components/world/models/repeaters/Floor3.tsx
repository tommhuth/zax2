import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Floor3() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor3.glb")
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