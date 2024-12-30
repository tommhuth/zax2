import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import model from "@assets/models/grass.glb"
import { useGLTF } from "@react-three/drei"

interface GrassModelProps {
    position: Tuple3
    rotation?: number
}

export default function GrassModel({ position, rotation = 0 }: GrassModelProps) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(model) as GLTFModel<["grass"]>

    return (
        <mesh
            geometry={nodes.grass.geometry}
            material={materials.grass}
            dispose={null}
            rotation-y={rotation}
            position={position}
        />
    )
} 