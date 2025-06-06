import { useInstance } from "../models/InstancedMesh"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"

interface DirtProps {
    position: Tuple3
    scale?: number
    rotation?: number
}

export default function Dirt({
    position: [x, y, z],
    rotation = 0,
    scale = 1
}: DirtProps) {
    let { position } = useWorldPart()

    useInstance("dirt", {
        scale,
        rotation: [0, rotation, 0],
        position: [x, y, position.z + z],
    })

    return null
}