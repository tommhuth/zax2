
import { useGLTF } from "@react-three/drei"
import { floorColor } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Floor2() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor2.glb")

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.floor2.geometry}
            >
                <MeshLambertFogMaterial
                    isInstance={false}
                    color={floorColor}
                    fogDensity={.5}
                />
            </mesh>
        </group>
    )
}