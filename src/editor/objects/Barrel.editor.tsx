
import barrelsModel from "@assets/models/barrels.glb"
import { useStore } from "@data/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"
import { GLTFModel } from "src/types.global"
import { useEditorObject } from "../data/hooks"

export default function BarellEditor() {
    let materials = useStore(i => i.materials)
    let type = useMemo(() => random.pick("barrel1", "barrel2", "barrel3", "barrel4"), [])
    let { nodes } = useGLTF(barrelsModel) as GLTFModel<["barrel1", "barrel2", "barrel3", "barrel4"]>
    let s = useEditorObject()

    return (
        <group
            position={s.position}
            dispose={null}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.barrel1.geometry}
                material={materials.barrel}
                visible={type === "barrel1"}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.barrel2.geometry}
                material={materials.barrel}
                visible={type === "barrel2"}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.barrel3.geometry}
                material={materials.barrel}
                visible={type === "barrel3"}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.barrel4.geometry}
                material={materials.barrel}
                visible={type === "barrel4"}
            />
        </group>
    )
}