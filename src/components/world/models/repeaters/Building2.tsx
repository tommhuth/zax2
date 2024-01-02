import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, groundFogIntensity } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"

export default function Building2() {
    const { nodes }: { nodes: any } = useGLTF("/models/building2.glb")

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube006.geometry}
                >
                    <MeshRetroMaterial 
                        isInstance={false}
                        color={buildingBase}
                        fogDensity={groundFogIntensity}
                    />
                </mesh>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube006_1.geometry}
                >
                    <meshBasicMaterial
                        isInstance={false}
                        color={buildingHi}
                        emssive={buildingHi}
                        emissiveIntensity={.95}
                    />
                </mesh>
            </group>
        </group>
    )
}