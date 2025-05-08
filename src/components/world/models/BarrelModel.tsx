import { useStore } from "@data/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useMemo, useState } from "react"
import { GLTFModel, Tuple3 } from "src/types.global"
import barrelsModel from "@assets/models/barrels.glb"
import { list } from "@data/utils"

const rotations = list(8 * 2)
    .map((i, index, list) => (index / list.length) * Math.PI * 2)

interface BarrelModelProps {
    type?: "barrel1" | "barrel2" | "barrel3" | "barrel4"
    position: Tuple3
}

export function BarrelModel({ position, type: typeOverride }: BarrelModelProps) {
    let type = useMemo(() => typeOverride || random.pick("barrel1", "barrel2", "barrel3", "barrel4"), [typeOverride])
    let { nodes } = useGLTF(barrelsModel) as GLTFModel<["barrel1", "barrel2", "barrel3", "barrel4"]>
    let [rotation] = useState(random.pick(...rotations))
    let materials = useStore(i => i.materials)

    return (
        <group
            position={position}
            rotation-y={rotation}
            dispose={null}
        >
            <mesh
                receiveShadow
                geometry={nodes.barrel1.geometry}
                material={materials.barrel}
                visible={type === "barrel1"}
            />
            <mesh
                receiveShadow
                geometry={nodes.barrel2.geometry}
                material={materials.barrel}
                visible={type === "barrel2"}
            />
            <mesh
                receiveShadow
                geometry={nodes.barrel3.geometry}
                material={materials.barrel}
                visible={type === "barrel3"}
            />
            <mesh
                receiveShadow
                geometry={nodes.barrel4.geometry}
                material={materials.barrel}
                visible={type === "barrel4"}
            />
        </group>
    )
}