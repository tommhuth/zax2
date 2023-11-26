import { useEffect } from "react"
import { useInstance } from "../../InstancedMesh"
import { setMatrixAt, setMatrixNullAt } from "../../../data/utils" 
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper"

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
            let flip = 1 // random.pick(-1, 1) 

            setMatrixAt({
                index,
                instance,
                // rotation: [0, random.pick(-.5, .25, 0, .25, .5), 0],
                scale: [flip, 1.75, flip],
                position: [position[0], position[1], partPosition[2] + position[2]]
            })

            return () => {
                setMatrixNullAt(instance, index as number)
            }
        }

    }, [index])

    return null
}