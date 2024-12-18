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
    position = [0, 0, 0],
    rotation = 0,
    health,
}: BarrelSpawnerProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createBarrel({
                position: [position[0], position[1], partPosition[2] + position[2]],
                rotation,
                health
            })
        })
    }, [...position])

    return null
}