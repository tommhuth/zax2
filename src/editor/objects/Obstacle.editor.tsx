import { useEditorObject } from "../data/hooks"
import ObstacleModel from "@components/world/models/ObstacleModel"

interface ObstacleEditorProps {
    id: string
    type: "device" | "rockface" | "box"
}

export default function ObstacleEditor({ id, type = "device" }: ObstacleEditorProps) {
    const object = useEditorObject(id)

    return (
        <ObstacleModel
            position={object.position}
            size={[object.width, object.height, object.depth]}
            rotation={object.rotation}
            type={type}
        />
    )
}