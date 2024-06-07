import { useGLTF } from "@react-three/drei" 
import { useStore } from "../../../../data/store"
import model from "@assets/models/floor1.glb"

export default function Floor1() {
    const { nodes }: { nodes: any } = useGLTF(model)
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