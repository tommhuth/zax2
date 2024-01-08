import { useEffect } from "react"
import { useInstance } from "../models/InstancedMesh"
import { setMatrixAt, setMatrixNullAt } from "../../../data/utils" 
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper"
import random from "@huth/random"

interface GrassProps {
    position: Tuple3
}

export default function Grass({
    position
}: GrassProps) {
    let [index, instance] = useInstance("grass")
    let partPosition = useWorldPart()

    useEffect(() => {
        if (typeof index === "number") {
            let flip = random.pick(Math.PI, 0)  

            setMatrixAt({
                index,
                instance,
                rotation: [0, flip, 0],
                scale: [1, 1.75, 1],
                position: [position[0], position[1], partPosition[2] + position[2]]
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }

    }, [index])

    return null
}