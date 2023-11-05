import { useEffect, useRef } from "react"
import { useRepeater } from "../../RepeaterMesh"
import { WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../World"
import random from "@huth/random"
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper"

interface EdgeBuildingProps {
    x?: number
    y?: number
    z?: number
    type?: RepeaterName
}

export default function EdgeBuilding({
    x = 0,
    z = 0,
    y = 0,
    type = random.pick("building1", "building2", "building3")
}: EdgeBuildingProps) {
    let building = useRepeater(type) 
    let partPosition = useWorldPart()

    useEffect(() => {
        if (building?.mesh) { 
            building.mesh.position.set(x + WORLD_RIGHT_EDGE + 4.5, y, z + partPosition[2])
            building.mesh.rotation.y = Math.PI
        }
    }, [building])

    return null
}