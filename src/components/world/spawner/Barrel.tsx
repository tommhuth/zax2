import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createBarrel } from "@data/store/actors/barrel.actions"

interface BarrelSpawnerProps {
    position: Tuple3
    rotation?: number
    health?: number
}

export default function BarrelSpawner({
    position: [x, y, z],
    rotation = 0,
    health,
}: BarrelSpawnerProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createBarrel({
                position: [x, y, partPosition[2] + z],
                rotation,
                health
            })
        })
    }, [partPosition, x, y, z, rotation, health])

    return null
}