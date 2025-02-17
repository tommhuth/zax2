import { useEffect } from "react"
import { useRepeater } from "../models/RepeaterMesh"
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper"
import { Tuple3 } from "../../../types.global"

interface EdgeElementProps {
    position: Tuple3
    rotation?: number
    scale?: Tuple3
    type: RepeaterName
}

export default function EdgeElement({
    position: [x, y, z],
    rotation = Math.PI,
    scale,
    type
}: EdgeElementProps) {
    let building = useRepeater(type)
    let partPosition = useWorldPart()

    useEffect(() => {
        if (building) {
            building.position.set(x, y, z + partPosition[2])
            building.rotation.y = rotation

            if (scale) {
                building.scale.set(...scale)
            }
        }
    }, [building, rotation, scale, x, y, z, partPosition])

    return null
}