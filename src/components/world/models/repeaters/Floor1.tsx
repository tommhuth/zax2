import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi, florFogIntensity } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Floor1() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor1b.glb")

    return (
        <group dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001?.geometry}
                >
                    <MeshLambertFogMaterial
                        isInstance={false} 
                        color={floorColor}
                        fogDensity={florFogIntensity}
                    />
                </mesh>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001_1?.geometry}
                >
                    <MeshLambertFogMaterial
                        isInstance={false}
                        color={floorColorHi}
                        fogDensity={florFogIntensity}
                    />
                </mesh>
            </group>
        </group>
    )
}