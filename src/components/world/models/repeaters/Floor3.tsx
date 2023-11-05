import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"
import { Mesh } from "three"

export default function Floor3(props) {
    const { nodes }: { nodes: any } = useGLTF("/models/floor3.glb")

    return (
        <group {...props} dispose={null} scale={.3}>
            <mesh
                receiveShadow
                geometry={nodes.floor3.geometry}
            >
                <MeshLambertFogMaterial color={floorColor} />
            </mesh>
        </group>
    )
}