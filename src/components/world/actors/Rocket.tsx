import { useMemo, useRef, useState } from "react"
import type { Rocket } from "../../../data/types"
import { Owner } from "../../../data/types"
import { useFrame } from "@react-three/fiber"
import { ndelta } from "../../../data/utils"
import { Mesh, Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../../types.global"
import { useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { createExplosion, createParticles, increaseTrauma } from "../../../data/store/effects"
import { useCollisionDetection } from "../../../data/collisions"
import { rocketColor } from "../../../data/theme"
import { WORLD_TOP_EDGE } from "../../../data/const"
import DebugBox from "@components/DebugBox"
import { useBaseActorHandler } from "@data/hooks"
import { removeRocket, damageRocket } from "@data/store/actors/rocket.actions"
import RocketModel from "../models/RocketModel"
import Exhaust from "../effects/Exhaust"

type ExplosionPart = [delay: number, offset: Tuple3, radius: number]

function explode(position: Vector3, size: Tuple3) {
    let shouldDoFireball = position.y < 2
    let ids: number[] = []

    if (shouldDoFireball) {
        createParticles({
            position: position.toArray(),
            speed: [15, 25],
            normal: [0, 0, 0],
            spread: [[-1, 1], [-1, 1]],
            count: [10, 15],
            radius: [.2, .6],
            color: rocketColor,
        })

        createExplosion({
            position: [position.x, 0, position.z],
            count: 16,
            shockwave: false,
            secondaryFireballCount: 3,
            radius: random.float(.65, .75),
            fireballCount: 8,
            fireballPath: [[position.x, 0, position.z], [0, 6, 0]]
        })
    } else {
        let explosions: ExplosionPart[] = [
            [155, [.2, size[1] / 2 - .2, .3], .2],
            [20, [-.2, -size[1] / 2, -.25], .3],
            [0, [.2, -size[1] / 2, -.25], .2],
        ]

        for (let [delay, [x, y, z], radius] of explosions) {
            let id = createExplosion({
                position: [position.x + x, position.y + y, position.z + z],
                count: 10,
                shockwave: true,
                radius,
                delay
            })

            ids.push(id)
        }

        let explosionId = createExplosion({
            position: [position.x, position.y, position.z],
            count: 20,
            radius: random.float(.8, 1),
            delay: 520,
            secondaryFireballCount: 3
        })
        let particlesId = createParticles({
            position: position.toArray(),
            speed: [5, 20],
            normal: [0, 0, 0],
            spread: [[-1, 1], [-1, 1]],
            count: [10, 15],
            radius: [.1, .55],
            color: rocketColor,
            delay: 520
        })

        return [...ids, explosionId, particlesId]
    }
}

export default function Rocket({
    position,
    aabb,
    size,
    id,
    client,
    health,
}: Rocket) {
    let [removed, setRemoved] = useState(false)
    let rocketRef = useRef<Mesh>(null)
    let data = useMemo(() => {
        return {
            speed: random.float(1, 2),
            takeoffAt: 20,
            rotationY: random.float(0, Math.PI * 2)
        }
    }, [])

    useBaseActorHandler({
        position,
        client,
        health,
        keepAround: true,
        size,
        aabb,
        remove: () => removeRocket(id),
        removeDelay: 400,
        destroy: () => {
            explode(position, size)
            setRemoved(true)
        }
    })

    useCollisionDetection({
        client,
        bullet: ({ bullet, normal, intersection }) => {
            if (bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damageRocket(id, 35)) {
                increaseScore(1_000)
                increaseTrauma(1.5)
            } else {
                increaseScore(250)
                increaseTrauma(.05)
            }

            createParticles({
                position: intersection,
                offset: [[-.5, .5], [0, .5], [-.5, .5]],
                speed: [5, 25],
                spread: [[0, .5], [.5, 2]],
                normal,
                count: [5, 8],
                radius: [.05, .2],
                stagger: [0, 0],
                color: rocketColor,
            })
        }
    })

    // movement
    useFrame((state, delta) => {
        let { player } = useStore.getState()
        let d = ndelta(delta)

        if (rocketRef.current && player.object) {
            if (Math.abs(position.z - player.object.position.z) < data.takeoffAt) {
                position.y += data.speed * d

                if (health === 0) {
                    data.speed -= .1 * 60 * d
                } else if (position.y > WORLD_TOP_EDGE + 2) {
                    data.speed += .75 * 60 * d
                } else {
                    data.speed += .01 * 60 * d
                }
            }

            rocketRef.current.position.copy(position)
        }
    })

    return (
        <>
            <RocketModel
                position={[position.x, 0, position.z]}
                ref={rocketRef}
                rotation={data.rotationY}
                removed={removed}
            />

            {!removed && (
                <Exhaust
                    targetPosition={position}
                    rotation={[-Math.PI * .5, 0, 0]}
                    scale={[.65, .5, 2]}
                    offset={[0, -4, 0]}
                    turbulence={2}
                />
            )}

            <DebugBox
                dynamic
                size={size}
                position={position}
            />
        </>
    )
}