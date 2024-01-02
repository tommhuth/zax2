import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, groundFogIntensity } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"

export default function Building1() {
    const { nodes }: { nodes: any } = useGLTF("/models/building1.glb")

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    geometry={nodes.Cube007.geometry}
                >
                    <MeshRetroMaterial
                        isInstance={false}
                        color={buildingBase}
                        fogDensity={groundFogIntensity}
                    />
                </mesh>
                <mesh
                    geometry={nodes.Cube007_1.geometry}
                >
                    <meshBasicMaterial 
                        color={buildingHi}  
                    />
                </mesh>
            </group>
        </group>
    )
}