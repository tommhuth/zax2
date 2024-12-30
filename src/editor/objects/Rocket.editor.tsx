import { useEditorObject } from "../data/hooks"
import RocketModel from "@components/world/models/RocketModel"

export default function RocketEditor({ id }) {
    let object = useEditorObject(id)

    return (
        <RocketModel
            position={object.position}
            removed
        />
    )
}