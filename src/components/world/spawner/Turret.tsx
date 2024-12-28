import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { createTurret } from "@data/store/actors/turret.actions"

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
    let [, , partZ] = useWorldPart()

    useEffect(() => {
        startTransition(() => {
            createTurret({
                fireFrequency,
                position: [x, y, z + partZ],
                rotation,
                floorLevel
            })
        })
    }, [fireFrequency, floorLevel, rotation, x, y, z, partZ])

    return null
}