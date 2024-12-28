import { useRepeater } from "@components/world/models/RepeaterMesh"
import { useEffect } from "react"
import { useEditorObject } from "../data/hooks"
import { RepeaterName } from "@data/types"

export default function RepeaterEditor({ type, id }: { id: string; type: RepeaterName }) {
    let building = useRepeater(type)
    let {
        rotation,
        position: [x, y, z],
        uniformScaler,
    } = useEditorObject(id)

    useEffect(() => {
        if (building) {
            building.position.set(x, y, z)
            building.rotation.y = rotation
            building.scale.setScalar(uniformScaler)
        }
    }, [building, rotation, x, y, z, uniformScaler])

    useEffect(() => {
        if (building) {
            return () => {
                building?.position.set(0, 0, -1000)
            }
        }
    }, [building])

    return null
}