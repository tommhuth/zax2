import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, groundFogIntensity } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Building3() {
    const { nodes }: { nodes: any } = useGLTF("/models/building3.glb")

    return (
        <group dispose={null} scale={.3}>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003.geometry}
            >
                <MeshLambertFogMaterial
                    isInstance={false}
                    color={buildingBase}
                    fogDensity={groundFogIntensity}
                />
            </mesh>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003_1.geometry}
            >
                <meshBasicMaterial
                    isInstance={false}
                    color={buildingHi}
                    emssive={buildingHi}
                    emissiveIntensity={.95}
                />
            </mesh>
        </group>
    )
}