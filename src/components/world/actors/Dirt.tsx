import { useEffect } from "react"
import { useInstance } from "../models/InstancedMesh"
import { setMatrixAt } from "../../../data/utils"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"

interface DirtProps {
    position: Tuple3
    scale?: number
    rotation?: number
}

export default function Dirt({
    position: [x, y, z],
    rotation = 0,
    scale = 1
}: DirtProps) {
    let [index, instance] = useInstance("dirt")
    let partPosition = useWorldPart()

    useEffect(() => {
        if (typeof index === "number") {
            setMatrixAt({
                instance,
                index,
                scale,
                rotation: [0, rotation, 0],
                position: [x, y, partPosition[2] + z],
            })
        }
    }, [index, scale, rotation, instance, x, y, z, partPosition])

    return null
}