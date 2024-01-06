import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Floor2() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor2.glb")
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.floor2.geometry} 
                material={materials.floorBase}
            />
        </group>
    )
}