import { useEffect } from "react"
import { useRepeater } from "../models/RepeaterMesh" 
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper" 
import { Tuple3 } from "../../../types"

interface EdgeBuildingProps {
    x?: number
    y?: number
    z?: number
    rotation?: number
    scale?: Tuple3
    type: RepeaterName
}

export default function EdgeBuilding({
    x = 0,
    z = 0,
    y = 0,
    rotation = Math.PI,
    scale,
    type
}: EdgeBuildingProps) {
    let building = useRepeater(type)
    let partPosition = useWorldPart()

    useEffect(() => {
        if (building?.mesh) {

            building.mesh.position.set(x, y, z + partPosition[2])
            building.mesh.rotation.y = rotation

            if (scale)
                building.mesh.scale.set(...scale) 
        }
    }, [building, rotation, x, y, z])

    return null
}