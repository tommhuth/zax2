import { useEffect, startTransition } from "react"
import { Tuple3 } from "../../../types"
import { createBuilding, removeBuilding } from "../../../data/store/world"
import { useWorldPart } from "../WorldPartWrapper"


interface BuildingProps {
    position?: Tuple3
    size?: Tuple3
}

export default function Building({
    size = [1, 1, 1],
    position = [0, 0, 0]
}: BuildingProps) {
    let partPosition = useWorldPart()

    useEffect(() => {
        let id: string

        startTransition(() => { 
            id = createBuilding(
                size,
                [position[0], position[1], partPosition[2] + position[2]],
            )
        })

        return () => {
            startTransition(() => {
                removeBuilding(id)
            })
        }
    }, [...size, ...position])

    return null
}