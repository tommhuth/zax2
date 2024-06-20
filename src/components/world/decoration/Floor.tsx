import { useEffect } from "react"
import { useRepeater } from "../models/RepeaterMesh"
import { Tuple3 } from "../../../types.global"
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper"

interface FloorProps {
    position: Tuple3
    type: RepeaterName
    scale?: Tuple3
}

export default function Floor({
    position: [x, y, z],
    type,
    scale = [1, 1, 1]
}: FloorProps) {
    let floor = useRepeater(type)
    let partPosition = useWorldPart()

    useEffect(() => {
        if (floor) {
            floor.position.set(x, y, z + partPosition[2])
            floor.scale.set(...scale)
        }
    }, [floor])

    return null
}