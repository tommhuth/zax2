import { useGLTF } from "@react-three/drei"
import { floorColor } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Floor3() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor3.glb")

    return (
        <group dispose={null} scale={.3}>
            <mesh
                receiveShadow
                geometry={nodes.floor3.geometry}
            >
                <MeshLambertFogMaterial isInstance={false} color={floorColor} />
            </mesh>
        </group>
    )
}