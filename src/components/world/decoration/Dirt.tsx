import { useEffect } from "react"
import { useInstance } from "../models/InstancedMesh"
import { setMatrixAt } from "../../../data/utils" 
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper"

interface DirtProps {
    position: Tuple3
    scale?:number
    rotation?: number
}

export default function Dirt({ position = [0, 0, 0], rotation = 0, scale = 1 }: DirtProps) {
    let [index, instance] = useInstance("dirt")
    let partPosition = useWorldPart()

    useEffect(() => {
        if (typeof index === "number") {
            setMatrixAt({
                instance,
                index,
                scale,
                rotation: [0, rotation, 0],
                position: [position[0], position[1], partPosition[2] + position[2]],
            })
        }
    }, [index, scale, rotation, instance, ...position])

    return null
}