import { useEditorObject } from "../data/hooks"
import PlaneModel from "@components/world/models/PlaneModel"
import { useMemo } from "react"
import { Vector3 } from "three"

export default function PlaneEditor({ id }) {
    let object = useEditorObject(id)
    let position = useMemo(() => new Vector3(...object.position), [object.position])

    return (
        <PlaneModel
            rotation={[0, object.rotation, 0]}
            position={position}
            moving={false}
        />
    )
}