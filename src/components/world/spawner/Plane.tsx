import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types"
import { createPlane, removePlane } from "../../../data/store/actors"
import { useWorldPart } from "../WorldPartWrapper"

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
        let id: string

        startTransition(() => { 
            id = createPlane({
                position: [position[0], position[1], partPosition[2] + position[2]],
                targetY,
                rotation,
                speed,
                fireFrequency
            })
        })

        return () => {
            startTransition(() => {
                removePlane(id)
            })
        }
    }, [...position])

    return null
}