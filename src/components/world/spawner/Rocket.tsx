import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createRocket } from "@data/store/actors/rocket.actions"

interface RocketSpawnerProps {
    position: Tuple3
}

export default function RocketSpawner({
    position = [0, 0, 0],
}: RocketSpawnerProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createRocket(
                [position[0], position[1], partPosition[2] + position[2]],
            )
        })
    }, position)

    return null
}