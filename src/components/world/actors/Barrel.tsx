import { useFrame } from "@react-three/fiber"
import { startTransition, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Vector3 } from "three"
import { useStore } from "../../../data/store"
import { Barrel, InstanceName, Owner } from "../../../data/types"
import { useInstance } from "../models/InstancedMesh"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { createExplosion, createImpactDecal, createParticles, createScrap, createShimmer } from "../../../data/store/effects"
import { damageBarrel, removeBarrel } from "../../../data/store/world"
import { barellParticleColor } from "../../../data/theme"
import { increaseScore } from "../../../data/store/player"
import { useBulletCollision } from "../../../data/collisions"
import Config from "../../../data/Config"

let _size = new Vector3()

function explode(position: Vector3, size: Tuple3, color: string) {
    createShimmer({
        position: [
            position.x,
            position.y + size[1] / 2,
            position.z,
        ],
        size: [4, 5, 4]
    })
    createExplosion({
        position: [position.x, 0, position.z],
        count: 10,
        radius: random.float(.65, .75),
        fireballPath: [[position.x, 1, position.z], [0, 4, 0]],
        fireballCount: random.pick(6, 0),
    })
    createParticles({
        position: [position.x, 1, position.z],
        speed: [5, 20],
        speedOffset: [[-15, 15], [0, 0], [-15, 15]],
        positionOffset: [[-1, 1], [0, 1], [-1, 1]],
        normal: [0, 1, 0],
        count: [10, 15],
        radius: [.1, .4],
        color,
    })
    createImpactDecal([position.x, 0, position.z])
    createScrap([position.x, position.y - size[1] * .65, position.z], 2, color)
}

export default function Barrel({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    health,
}: Barrel) {
    let removed = useRef(false)
    let [rotation] = useState(random.pick(
        ...new Array(8 * 2)
            .fill(null)
            .map((i, index, list) => (index / list.length) * Math.PI * 2)
    ))
    let model: InstanceName = useMemo(() => {
        return random.pick("barrel1", "barrel2", "barrel3", "barrel4")
    }, [])
    let [index, instance] = useInstance(model, {
        position: [position.x, position.y - size[1] / 2, position.z],
        rotation: [0, rotation, 0]
    })
    let remove = () => {
        setTimeout(() => removeBarrel(id), 300)
        removed.current = true
    }

    useBulletCollision({
        name: "bulletcollision:barrel",
        handler: ({ detail: { bullet, client } }) => {
            if (bullet.owner !== Owner.PLAYER || client.data.id !== id) {
                return
            }

            damageBarrel(id, 100)
            increaseScore(1000)
        }
    })

    useLayoutEffect(() => {
        if (health === 0) {
            startTransition(() => {
                remove()
                explode(position, size, barellParticleColor)
            })
        }
    }, [health])

    useFrame(() => {
        let { world, player } = useStore.getState()

        if (instance && typeof index === "number" && !removed.current) {
            aabb.setFromCenterAndSize(position, _size.set(...size))

            if (!world.frustum.intersectsBox(aabb) && player.object && position.z < player.object.position.z) {
                remove()
            }
        }
    })

    if (!Config.DEBUG) {
        return null
    }

    return (
        <mesh position={position.toArray()}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" />
        </mesh>
    )
}