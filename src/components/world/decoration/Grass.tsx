import { GLTFModel } from "src/types.global"
import { useStore } from "../../../data/store"
import { useWorldPart } from "../WorldPartWrapper"
import model from "@assets/models/grass.glb"
import { useGLTF } from "@react-three/drei"
import { Vector3 } from "three"
import { useMemo } from "react"
import { useFrame } from "@react-three/fiber"

export default function Grass({ position, rotation = 0 }) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(model) as GLTFModel<["grass"]>
    let partPosition = useWorldPart()
    let uniforms = useMemo(() => ({
        uTime: { value: 0, needsUpdate: true },
        uPlayerPosition: { value: new Vector3(), needsUpdate: true }
    }), [])

    useFrame(() => {
        let { player, effects } = useStore.getState()

        uniforms.uPlayerPosition.value.copy(player.position)
        uniforms.uPlayerPosition.needsUpdate = true

        uniforms.uTime.value = effects.time
        uniforms.uTime.needsUpdate = true
    })

    return (
        <mesh 
            geometry={nodes.grass.geometry}
            material={materials.grass}
            dispose={null}
            rotation-y={rotation}
            position={[position[0], position[1], position[2] + partPosition[2]]}
            scale-y={1.75}
        />
    )
} 