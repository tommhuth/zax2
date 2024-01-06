import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Building2() {
    const { nodes }: { nodes: any } = useGLTF("/models/building2.glb")
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh 
                    geometry={nodes.Cube006.geometry}
                    material={materials.buildingBase}
                />
                <mesh 
                    geometry={nodes.Cube006_1.geometry} 
                    material={materials.buildingHi}
                >
                </mesh>
            </group>
        </group>
    )
}