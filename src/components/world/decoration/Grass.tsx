import { GLTFModel } from "src/types.global"
import { useStore } from "../../../data/store"
import { useWorldPart } from "../WorldPartWrapper"
import model from "@assets/models/grass.glb"
import { useGLTF } from "@react-three/drei"

export default function Grass({ position: [x, y, z], rotation = 0 }) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(model) as GLTFModel<["grass"]>
    let partPosition = useWorldPart()

    return (
        <mesh
            geometry={nodes.grass.geometry}
            material={materials.grass}
            dispose={null}
            rotation-y={rotation}
            position={[x, y, partPosition[2] + z]}
        />
    )
} 