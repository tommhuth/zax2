import { useEffect } from "react"
import { useRepeater } from "../models/RepeaterMesh"
import { Tuple3 } from "../../../types"
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper"

interface FloorProps {
    position: Tuple3
    type: RepeaterName
    scale?: Tuple3
}

export default function Floor({ 
    position: [x, y, z] = [0,0,0], 
    type, 
    scale = [1,1,1] 
}: FloorProps) {
    let floor = useRepeater(type)
    let partPosition = useWorldPart()

    useEffect(() => { 
        if (floor) { 
            floor.mesh.position.set(x, y, z + partPosition[2])
            floor.mesh.scale.set(...scale)
        }
    }, [floor?.mesh])

    return null
}