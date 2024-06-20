import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createTurret } from "@data/store/actors/turret.actions"

interface TurretProps {
    position?: Tuple3
    fireFrequency?: number
    rotation?: number
    floorLevel: number
}

export default function Turret({
    fireFrequency,
    position = [0, 0, 0],
    rotation = 0,
    floorLevel
}: TurretProps) {
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
    }, [fireFrequency, floorLevel, ...position])

    return null
}