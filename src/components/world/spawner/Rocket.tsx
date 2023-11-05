import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types"
import { createRocket, removeRocket } from "../../../data/store/actors"
import { useWorldPart } from "../WorldPartWrapper"

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
        let id: string

        startTransition(() => { 
            id = createRocket(
                [position[0], position[1], partPosition[2] + position[2]],
                speed,
                health
            )
        })

        return () => {
            startTransition(() => {
                removeRocket(id)
            })
        }
    }, [...position])

    return null
}