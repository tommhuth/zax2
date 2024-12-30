import { useInstance } from "../models/InstancedMesh"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"

interface CableProps {
    position: Tuple3
    scale?: number
    rotation?: number
}

export default function Cable({
    position: [x, y, z],
    rotation = 0,
    scale = 1
}: CableProps) {
    let partPosition = useWorldPart()

    useInstance("cable", {
        scale,
        rotation: [0, rotation, 0],
        position: [x, y, partPosition[2] + z],
    })

    return null
}