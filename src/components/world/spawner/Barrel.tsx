import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { createBarrel } from "../../../data/store/world"
import { useWorldPart } from "../WorldPartWrapper"

interface BarrelProps {
    position: Tuple3
    rotation?: number
    health?: number
}

export default function Barrel({
    position = [0, 0, 0],
    rotation = 0,
    health,
}: BarrelProps) {
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