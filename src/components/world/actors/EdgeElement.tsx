import { useEffect } from "react"
import { useRepeater } from "../models/RepeaterMesh"
import { RepeaterName } from "../../../data/types"
import { useWorldPart } from "../WorldPartWrapper"
import { Tuple3 } from "../../../types.global"

interface EdgeElementProps {
    position: Tuple3
    rotation?: number
    scale?: Tuple3
    type: RepeaterName
}

export default function EdgeElement({
    position: [x, y, z],
    rotation = Math.PI,
    scale,
    type
}: EdgeElementProps) {
    let building = useRepeater(type)
    let { position } = useWorldPart()

    useEffect(() => {
        if (building) {
            building.position.set(x, y, z + position.z)
            building.rotation.y = rotation

            if (scale) {
                building.scale.set(...scale)
            }

            return () => {
                building?.position.set(0, 0, 0)
            }
        }
    }, [building, rotation, scale, x, y, z, position.z])

    return null
}