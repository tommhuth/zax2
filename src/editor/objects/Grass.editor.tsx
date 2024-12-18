import { useStore } from "@data/store" 
import { useGLTF } from "@react-three/drei" 
import { GLTFModel } from "src/types.global"
import { useEditorObject } from "../data/hooks"
import model from "@assets/models/grass.glb" 

export default function GrassEditor({ id }) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(model) as GLTFModel<["grass"]> 
    let object = useEditorObject(id)

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.grass.geometry}
            material={materials.grass}
            dispose={null}
            position={object.position}
            scale-y={1.75}
            rotation-y={object.rotation} 
        />
    )
}
 
 