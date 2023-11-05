import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Floor1(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor1b.glb")

    return (
        <group {...props} dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001.geometry}
                >
                    <MeshLambertFogMaterial color={floorColor} />
                </mesh>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001_1.geometry}
                >
                    <MeshLambertFogMaterial color={floorColorHi} />
                </mesh>
            </group>
        </group>
    )
}