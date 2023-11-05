import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Building2(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/building2.glb")

    return (
        <group {...props} dispose={null}>
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

 