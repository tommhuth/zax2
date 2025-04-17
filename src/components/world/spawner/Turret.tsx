import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createTurret, removeTurret } from "@data/store/actors/turret.actions"

interface TurretSpawnerProps {
    position?: Tuple3
    fireFrequency?: number
    rotation?: number
    floorLevel: number
}

export default function TurretSpawner({
    fireFrequency,
    position: [x, y, z] = [0, 0, 0],
    rotation = 0,
    floorLevel
}: TurretSpawnerProps) {
    let part = useWorldPart()

    useEffect(() => {
        let id: string

        startTransition(() => {
            id = createTurret({
                fireFrequency,
                position: [x, y, z + part.position.z],
                rotation,
                floorLevel
            })
        })

        return () => {
            startTransition(() => removeTurret(id))
        }
    }, [fireFrequency, floorLevel, rotation, x, y, z, part.position.z])

    return null
}