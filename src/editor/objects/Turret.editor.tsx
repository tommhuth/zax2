import { useEditorObject } from "../data/hooks"
import TurretModel from "@components/world/models/TurretModel"

export default function TurretEditor({ id }) {
    let object = useEditorObject(id)

    return (
        <TurretModel
            position={object.position}
            rotation={object.rotation}
        />
    )
}