import { useGLTF } from "@react-three/drei"
import { buildingBase, buildingHi } from "../../../../data/theme"
import { MeshLambertFogMaterial } from "../../MeshLambertFogMaterial"

export default function Hangar() {
    const { nodes }: { nodes: any } = useGLTF("/models/hangar.glb")

    return (
        <group dispose={null}>
            <mesh
                receiveShadow
                geometry={nodes.Cube.geometry}
            >
                <MeshLambertFogMaterial isInstance={false} color={buildingBase} />
            </mesh>
            <mesh
                receiveShadow
                geometry={nodes.Cube_1.geometry}
            >
                <meshBasicMaterial 
                    isInstance={false} 
                    color={buildingHi} 
                />
            </mesh>
        </group>
    )
}