import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createPlane } from "@data/store/actors/plane.actions"

interface PlaneProps {
    position: Tuple3
    fireFrequency?: number
    speed?: number
    targetY?: number
    rotation?: number
}

export default function Plane({
    position = [0, 0, 0],
    speed,
    fireFrequency,
    rotation,
    targetY,
}: PlaneProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createPlane({
                position: [position[0], position[1], partPosition[2] + position[2]],
                targetY,
                rotation,
                speed,
                fireFrequency
            })
        })
    }, [...position])

    return null
}