import { useGLTF } from "@react-three/drei"
import { floorColor, floorColorHi, floorFogIntensity } from "../../../../data/theme"
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
                        fogDensity={floorFogIntensity}
                    />
                </mesh>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001_1?.geometry}
                >
                    <MeshLambertFogMaterial
                        isInstance={false}
                        color={floorColorHi}
                        fogDensity={floorFogIntensity}
                    />
                </mesh>
            </group>
        </group>
    )
}