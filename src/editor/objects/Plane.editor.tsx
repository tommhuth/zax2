import { useStore } from "@data/store"
import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"
import { useEditorObject } from "../data/hooks"
import planeModel from "@assets/models/plane.glb"

export default function PlaneEditor({ id }) {
    let materials = useStore(i => i.materials)
    let { nodes } = useGLTF(planeModel) as GLTFModel<["plane"]>
    let object = useEditorObject(id)

    return (
        <mesh
            castShadow
            receiveShadow
            rotation-y={object.rotation}
            position={object.position} 
            material={materials.plane}
            dispose={null}
        >
            <primitive
                object={nodes.plane.geometry}
                attach="geometry"
            />
        </mesh>
    )
}