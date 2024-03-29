import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types"
import { createTurret, removeTurret } from "../../../data/store/actors"
import { useWorldPart } from "../WorldPartWrapper"

interface TurretProps {
    position?: Tuple3
    fireFrequency?: number
    rotation?: number
    floorLevel: number
}

export default function Turret({
    fireFrequency,
    position = [0, 0, 0],
    rotation = 0,
    floorLevel
}: TurretProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        let id: string

        startTransition(() => { 
            id = createTurret({ 
                fireFrequency, 
                position: [position[0], position[1], partPosition[2] + position[2]],
                rotation,
                floorLevel
            })
        })

        return () => {
            startTransition(() => {
                removeTurret(id)
            })
        }
    }, [fireFrequency, floorLevel, ...position])

    return null
}