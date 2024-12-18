import { useEditorObject } from "../data/hooks"
import { InstanceName } from "@data/types"
import { useInstance } from "@components/world/models/InstancedMesh"

export default function InstanceEditor({ type, id }: { id: string; type: InstanceName }) {
    let {
        rotation,
        position, 
        uniformScaler
    } = useEditorObject(id)

    useInstance(type, {
        position,
        rotation: [0, rotation, 0],
        scale: uniformScaler
    }) 

    return null
}