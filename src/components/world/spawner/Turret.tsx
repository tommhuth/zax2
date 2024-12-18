import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createTurret } from "@data/store/actors/turret.actions"

interface TurretSpawnerProps {
    position?: Tuple3
    fireFrequency?: number
    rotation?: number
    floorLevel: number
}

export default function TurretSpawner({
    fireFrequency,
    position = [0, 0, 0],
    rotation = 0,
    floorLevel
}: TurretSpawnerProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createTurret({
                fireFrequency,
                position: [position[0], position[1], partPosition[2] + position[2]],
                rotation,
                floorLevel
            })
        })
    }, [fireFrequency, floorLevel, rotation, ...partPosition, ...position])

    return null
}