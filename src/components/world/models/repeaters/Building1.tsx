import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Building1() {
    const { nodes }: { nodes: any } = useGLTF("/models/building1.glb")

    return (
        <group dispose={null}>
            <group position={[0, 0, 0]} scale={.3}>
                <mesh
                    geometry={nodes.Cube007.geometry}
                >
                    <MeshLambertFogMaterial
                        isInstance={false}
                        color={buildingBase}
                        fogDensity={.5}
                    />
                </mesh>
                <mesh
                    geometry={nodes.Cube007_1.geometry}
                >
                    <meshBasicMaterial 
                        color={buildingHi}  
                    />
                </mesh>
            </group>
        </group>
    )
}