import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createRocket } from "@data/store/actors/rocket.actions"

interface RocketSpawnerProps {
    position: Tuple3
}

export default function RocketSpawner({
    position: [x, y, z] = [0, 0, 0],
}: RocketSpawnerProps) {
    let part = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createRocket(
                [x, y, z + part.position.z],
            )
        })
    }, [x, y, z, part.position.z])

    return null
}