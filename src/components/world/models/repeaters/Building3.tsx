import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export  default function Building3(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/building3.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003.geometry}
            >
                <MeshLambertFogMaterial isInstance={false} color={buildingBase} />
            </mesh>
            <mesh
                // castShadow
                // receiveShadow
                geometry={nodes.Cube003_1.geometry}
            >
                <MeshLambertFogMaterial isInstance={false} color={buildingHi} />
            </mesh>
        </group>
    )
}