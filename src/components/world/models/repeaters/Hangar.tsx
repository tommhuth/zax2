import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi, groundFogIntensity } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"

export default function Hangar() {
    const { nodes }: { nodes: any } = useGLTF("/models/hangar.glb")

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.Cube.geometry}
            >
                <MeshRetroMaterial
                    isInstance={false}
                    fogDensity={groundFogIntensity}
                    color={buildingBase}
                />
            </mesh>
            <mesh
                receiveShadow
                geometry={nodes.Cube_1.geometry}
            >
                <meshBasicMaterial
                    color={buildingHi}
                />
            </mesh>
        </group>
    )
}