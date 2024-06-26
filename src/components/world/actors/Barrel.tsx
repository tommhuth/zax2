import { useMemo, useState } from "react"
import { Vector3 } from "three"
import { Barrel as BarrelType, Owner } from "../../../data/types"
import random from "@huth/random"
import { GLTFModel, Tuple3 } from "../../../types.global"
import { createExplosion, createImpactDecal, createParticles, createScrap, increaseTrauma } from "../../../data/store/effects"
import { barellParticleColor } from "../../../data/theme"
import { increaseScore } from "../../../data/store/player"
import { useCollisionDetection } from "../../../data/collisions"
import { useBaseActorHandler } from "../../../data/hooks"
import { useStore } from "../../../data/store"

import barrelsModel from "@assets/models/barrels.glb"
import { useGLTF } from "@react-three/drei"
import DebugBox from "@components/DebugBox"
import { removeBarrel, damageBarrel } from "@data/store/actors/barrel.actions"

function explode(position: Vector3, size: Tuple3, color: string) {
    createExplosion({
        position: [position.x, .5, position.z],
        count: 10,
        radius: random.float(.65, .75),
        fireballPath: [[position.x, 1, position.z], [0, 4, 0]],
        fireballCount: random.pick(6, 0),
    })
    createParticles({
        position: [position.x, .5, position.z],
        offset: [[-.5, .5], [0, .5], [-.5, .5]],
        speed: [5, 25],
        normal: [0, 1, 0],
        spread: [[-1, 1], [.5, 2]],
        count: [15, 20],
        radius: [.1, .4],
        color,
        stagger: [-150, 0]
    })
    createImpactDecal([position.x, 0, position.z])
    createScrap([position.x, position.y - size[1] * .65, position.z], 2, color)
}

const rotations = new Array(8 * 2)
    .fill(null)
    .map((i, index, list) => (index / list.length) * Math.PI * 2)

export default function Barrel({
    position,
    size,
    id,
    client,
    health,
}: BarrelType) {
    let type = useMemo(() => random.pick("barrel1", "barrel2", "barrel3", "barrel4"), [])
    let { nodes } = useGLTF(barrelsModel) as GLTFModel<["barrel1", "barrel2", "barrel3", "barrel4"]>
    let [rotation] = useState(random.pick(...rotations))
    let materials = useStore(i => i.materials)

    useBaseActorHandler({
        health,
        client,
        position,
        removeDelay: 300,
        destroy: () => explode(position, size, barellParticleColor),
        remove: () => removeBarrel(id)
    })

    useCollisionDetection({
        client,
        bullet: ({ bullet }) => {
            if (bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damageBarrel(id, 100)) {
                increaseScore(150)
                increaseTrauma(.35)
            }
        }
    })

    return (
        <>
            <group
                position={[position.x, position.y - size[1] / 2, position.z]}
                rotation-y={rotation}
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

            <DebugBox size={size} position={position} />
        </>
    )
}