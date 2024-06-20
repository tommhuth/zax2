import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createRocket } from "@data/store/actors/rocket.actions"

interface RocketProps {
    position: Tuple3
    health?: number
    speed?: number
}

export default function Rocket({
    position = [0, 0, 0],
    speed,
    health,
}: RocketProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createRocket(
                [position[0], position[1], partPosition[2] + position[2]],
                speed,
                health
            )
        })
    }, [...position])

    return null
}