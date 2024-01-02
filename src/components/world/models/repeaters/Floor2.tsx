
import { useGLTF } from "@react-three/drei"
import { floorColor, floorFogIntensity } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"

export default function Floor2() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor2.glb")

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.floor2.geometry}
            >
                <MeshRetroMaterial
                    isInstance={false}
                    color={floorColor}
                    fogDensity={floorFogIntensity}
                />
            </mesh>
        </group>
    )
}