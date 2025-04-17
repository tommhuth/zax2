import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createPlane, removePlane } from "@data/store/actors/plane.actions"

interface PlaneSpawnerProps {
    position: Tuple3
    fireFrequency?: number
    speed?: number
    targetY?: number
    rotation?: number
}

export default function PlaneSpawner({
    position: [x, y, z],
    speed,
    fireFrequency,
    rotation,
    targetY,
}: PlaneSpawnerProps) {
    let part = useWorldPart()

    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createPlane({
                position: [x, y, z + part.position.z],
                targetY,
                rotation,
                speed,
                fireFrequency
            })
        })

        return () => {
            startTransition(() => removePlane(id))
        }
    }, [fireFrequency, part.position.z, x, y, z, rotation, speed, targetY])

    return null
}