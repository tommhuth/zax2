import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor2.glb"

export default function Floor2() {
    const { nodes }: { nodes: any } = useGLTF(model)
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