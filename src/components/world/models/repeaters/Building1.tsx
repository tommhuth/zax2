import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"
 
export default function Building1() {
    const { nodes }: { nodes: any } = useGLTF("/models/building1.glb")
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    geometry={nodes.Cube007.geometry}
                    material={materials.buildingBase}
                />
                <mesh
                    geometry={nodes.Cube007_1.geometry}
                    material={materials.buildingHi}
                />
            </group>
        </group>
    )
}