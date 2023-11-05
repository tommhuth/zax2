
import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Floor2(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor2.glb")

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.floor2.geometry}
            >
                <MeshLambertFogMaterial color={floorColor} />
            </mesh>
        </group>
    )
}