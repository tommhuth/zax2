import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Building1() {
    const { nodes }: { nodes: any } = useGLTF("/models/building1.glb")

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube007.geometry}
                >
                    <MeshLambertFogMaterial isInstance={false} color={buildingBase} />
                </mesh>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={nodes.Cube007_1.geometry}
                >
                    <MeshLambertFogMaterial isInstance={false} color={buildingHi} />
                </mesh>
            </group>
        </group>
    )
}