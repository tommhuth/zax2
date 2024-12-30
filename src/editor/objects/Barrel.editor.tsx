import { useEditorObject } from "../data/hooks"
import { BarrelModel } from "@components/world/models/BarrelModel"

export default function BarellEditor({ id }) {
    let object = useEditorObject(id)

    return (
        <BarrelModel
            position={object.position}
        />
    )
}