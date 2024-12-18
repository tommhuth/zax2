import { useStore } from "@data/store"
import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"
import { useEditorObject } from "../data/hooks"
import models from "@assets/models/rocket.glb"

export default function RocketEditor({ id }) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(models) as GLTFModel<["rocket", "platform"]>
    let object = useEditorObject(id)

    return (
        <mesh
            castShadow
            receiveShadow
            dispose={null}
            geometry={nodes.platform.geometry}
            material={materials.device}
            position={object.position}
        />
    )
}