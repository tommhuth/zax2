import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

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
                    <MeshLambertFogMaterial isInstance={false} color={buildingBase} />
                </mesh>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube006_1.geometry}
                >
                    <MeshLambertFogMaterial isInstance={false} color={buildingHi} />
                </mesh>
            </group>
        </group>
    )
}

 