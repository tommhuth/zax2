import { startTransition, useEffect } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createRocket, removeRocket } from "@data/store/actors/rocket.actions"

interface RocketSpawnerProps {
    position: Tuple3
}

export default function RocketSpawner({
    position: [x, y, z] = [0, 0, 0],
}: RocketSpawnerProps) {
    let part = useWorldPart()

    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createRocket([x, y, z + part.position.z])
        })

        return () => {
            startTransition(() => removeRocket(id))
        }
    }, [x, y, z, part.position.z])

    return null
}