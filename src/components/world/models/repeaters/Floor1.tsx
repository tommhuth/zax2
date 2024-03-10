import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"

export default function Floor1() {
    const { nodes }: { nodes: any } = useGLTF("/models/floor1.glb")
    let materials = useStore(i => i.materials)

    return (
        <group dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001?.geometry}
                    material={materials.floorBase}
                />
                <mesh
                    receiveShadow
                    geometry={nodes.Plane001_1?.geometry}
                    material={materials.floorHi}
                />
            </group>
        </group>
    )
}