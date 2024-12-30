import GrassModel from "@components/world/models/GrassModel"
import { useEditorObject } from "../data/hooks"

export default function GrassEditor({ id }) {
    let object = useEditorObject(id)

    return (
        <GrassModel
            position={object.position}
            rotation={object.rotation}
        />
    )
} 