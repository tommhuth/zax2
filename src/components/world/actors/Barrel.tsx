import { useState } from "react"
import { Vector3 } from "three"
import { Barrel as BarrelType, Owner } from "../../../data/types"
import random from "@huth/random"
import { Tuple3 } from "../../../types.global"
import { createExplosion, createImpactDecal, createParticles, createScrap, increaseTrauma } from "../../../data/store/effects"
import { barellParticleColor } from "../../../data/theme"
import { increaseScore } from "../../../data/store/player"
import { useCollisionDetection } from "../../../data/collisions"
import { useBaseActorHandler } from "../../../data/hooks"
import DebugBox from "@components/DebugBox"
import { removeBarrel, damageBarrel } from "@data/store/actors/barrel.actions"
import { BarrelModel } from "../models/BarrelModel"
import { list } from "@data/utils"

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
        offset: [[-1.5, 1.5], [-1.5, 1.5], [-1.5, 1.5]],
        speed: [5, 25],
        normal: [0, 1, 0],
        spread: [[-1, 1], [.5, 2]],
        count: [15, 20],
        radius: [.1, .4],
        color,
        stagger: [-150, 0],
    })
    createImpactDecal([position.x, 0, position.z])
    createScrap([position.x, position.y - size[1] * .65, position.z], 2, color)
}

const rotations = list(8 * 2)
    .map((i, index, list) => (index / list.length) * Math.PI * 2)

export default function Barrel({
    position,
    size,
    id,
    client,
    health,
}: BarrelType) {
    let [rotation] = useState(random.pick(...rotations))

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
            <BarrelModel
                position={[position.x, position.y - size[1] / 2, position.z]}
                rotation-y={rotation}
            />

            <DebugBox size={size} position={position} />
        </>
    )
}