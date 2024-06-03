import { useGLTF } from "@react-three/drei"

import rockface from "../../../../assets/models/rockface.glb"
import { useStore } from "../../../data/store"

export function Rockface() {
    const { nodes } = useGLTF(rockface)
    const materials = useStore(i => i.materials)

    return (
        <mesh
            castShadow
            receiveShadow
            dispose={null}
            geometry={nodes.rockface.geometry}
            material={materials.floorBase}
        />
    )
}

useGLTF.preload(rockface)