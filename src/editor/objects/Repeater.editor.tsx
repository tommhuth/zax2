import { useRepeater } from "@components/world/models/RepeaterMesh"
import { useEffect } from "react"
import { useEditorObject } from "../data/hooks"
import { RepeaterName } from "@data/types"

export default function RepaterEditor({ type, id }: { id: string; type: RepeaterName }) {
    let building = useRepeater(type)
    let {
        rotation,
        position: [x, y, z],
        scale = [1, 1, 1]
    } = useEditorObject(id)

    useEffect(() => {
        if (building) {
            building.position.set(x, y, z)
            building.rotation.y = rotation
            building.scale.set(...scale)
        }
    }, [building, rotation, x, y, z])

    useEffect(() => {
        if (building) {
            return () => {
                building?.position.set(0, 0, -1000)
            }
        }
    }, [building])

    return null
}