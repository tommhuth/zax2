import { useEditorObject } from "../data/hooks"
import ObstacleModel from "@components/world/models/ObstacleModel"

interface ObstacleEditorProps {
    id: string
    type: "device" | "rockface" | "box" | "empty"
}

export default function ObstacleEditor({ id, type = "device" }: ObstacleEditorProps) {
    const object = useEditorObject(id)

    if (type === "empty") {
        return null
    }

    return (
        <ObstacleModel
            position={object.position}
            size={[object.width, object.height, object.depth]}
            rotation={object.rotation}
            type={type}
        />
    )
}