import { memo, startTransition, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { clamp, ndelta } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types.global"
import { Mesh, Vector3 } from "three"
import { Owner, Plane as PlaneType } from "../../../data/types"
import { store, useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { createExplosion, createImpactDecal, createParticles, createScrap, increaseTrauma } from "../../../data/store/effects"
import { planeColor } from "../../../data/theme"
import { damp } from "three/src/math/MathUtils.js"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../../../data/const"

import DebugBox from "@components/DebugBox"
import { createBullet } from "@data/store/actors/bullet.actions"
import { removePlane, damagePlane } from "@data/store/actors/plane.actions"
import { damageTurret } from "@data/store/actors/turret.actions"
import { damageBarrel } from "@data/store/actors/barrel.actions"
import PlaneModel from "../models/PlaneModel"
import Counter from "@data/lib/Counter"
import useCollisionDetection from "@data/lib/useCollisionDetection"
import { easeInOutCubic } from "@data/lib/shaping"
import { useBaseActorHandler } from "@data/lib/useBaseActorHandler"

function explode(position: Vector3) {
    createExplosion({
        position: [position.x, position.y - 1, position.z],
        count: 16,
        radius: .55,
        shockwave: true,
    })
    createParticles({
        position: position.toArray(),
        speed: [14, 20],
        spread: [[-.25, .25], [-.5, 1]],
        normal: [0, -.5, 0],
        count: [10, 15],
        stagger: [-100, 0],
        radius: [.1, .45],
        color: planeColor,
    })
}

function Plane({
    id,
    size,
    position,
    targetY,
    startY,
    aabb,
    client,
    health,
    takeoffAt,
    fireFrequency,
    speed,
    rotation,
}: PlaneType) {
    let planeRef = useRef<Mesh>(null)
    let data = useMemo(() => ({
        removed: false,
        grounded: false,
        gravity: 0,
        currentSpeed: speed,
        rotation: [0, rotation + Math.PI, 0] as Tuple3,
        tilt: random.float(0.002, 0.05),
        shootTimer: random.float(0, fireFrequency),
        nextShotAt: fireFrequency * .5,
        liftoffDuration: 4_300,
        liftoffTimer: 0,
    }), [fireFrequency, rotation, speed])
    let bottomY = 0
    let weaponSide = useMemo(() => new Counter(2), [])
    let moving = speed > 0
    let diagonal = useStore(i => i.world.diagonal)

    useBaseActorHandler({
        client,
        position,
        size,
        aabb,
        health,
        moving,
        keepAround: moving,
        remove: () => removePlane(id),
        destroy: (position) => {
            explode(position)

            if (!moving) {
                createImpactDecal([position.x, .1, position.z], 2.25)
            }
        }
    })

    useCollisionDetection({
        client,
        bullet: ({ bullet, intersection, normal }) => {
            if (bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damagePlane(id, 50)) {
                increaseScore(1_000)
                increaseTrauma(.25)
            } else {
                increaseScore(100)
                increaseTrauma(.05)
            }

            createParticles({
                position: intersection,
                count: [4, 7],
                speed: [8, 12],
                offset: [[0, 0], [0, 0], [0, 0]],
                spread: [[-1, 1], [-1, 1]],
                normal,
                color: planeColor,
            })
        },
        turret: (data) => {
            damageTurret(data.id, 100)
        },
        barrel: (data) => {
            damageBarrel(data.id, 100)
        },
    })

    // shoot
    useFrame((state, delta) => {
        let playerPosition = store.getState().player.object?.position
        let { world, effects } = store.getState()

        if (!playerPosition || !moving) {
            return
        }

        let distanceFromPlayer = 1 - clamp((-position.z - playerPosition.z) / 15, 0, 1)
        let heightPenalty = 1 - clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)
        let shootDisabled = position.z > playerPosition.z || !world.frustum.containsPoint(position)
        let alive = health > 0
        let nextShotAt = data.nextShotAt + heightPenalty * fireFrequency * .35

        if (!shootDisabled && alive && data.shootTimer > nextShotAt) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x + (weaponSide.current === 1 ? -.8 : .8),
                        position.y,
                        position.z - 2
                    ],
                    speed: 30,
                    rotation: Math.PI * .5,
                    owner: Owner.ENEMY
                })
                data.shootTimer = 0
                data.nextShotAt = (fireFrequency - fireFrequency * distanceFromPlayer * .5) * (1 / effects.timeScale)
            })
            weaponSide.next()
        }

        data.shootTimer += ndelta(delta) * 1000
    })

    // move
    useFrame((state, delta) => {
        if (planeRef.current && !data.removed && moving) {
            let { player } = useStore.getState()
            let playerZ = player.object?.position.z || Infinity
            let shouldMoveForward = targetY === startY || position.z - diagonal * 1.5 < playerZ

            position.z -= shouldMoveForward ? data.currentSpeed * ndelta(delta) : 0

            planeRef.current.position.copy(position)
            planeRef.current.rotation.set(...data.rotation)
        }
    })

    // grounding
    useFrame((state, delta) => {
        if (health === 0 && moving) {
            if (!data.grounded) {
                let nd = ndelta(delta)

                data.gravity += .25 * nd
                position.y -= data.gravity * 60 * nd
                data.rotation[0] -= data.tilt * .5 * 60 * nd
                data.rotation[2] += data.tilt * .25 * 60 * nd
                data.currentSpeed = damp(data.currentSpeed, 0, .5, nd)
                data.grounded = position.y <= (bottomY + .5 / 2)

                if (data.grounded) {
                    startTransition(() => {
                        createExplosion({
                            position: [position.x, -.5, position.z],
                            count: 18,
                            radius: .6,
                            fireballCount: 5,
                            fireballPath: [[position.x, 0, position.z], [0, 4, 0]]
                        })
                        createParticles({
                            position: [position.x, 0, position.z],
                            normal: [0, 1, 0],
                            speed: [10, 20],
                            count: [6, 10],
                            color: planeColor,
                            spread: [[-1, 1], [0, 1]]
                        })
                        createScrap([position.x, .1, position.z], 1, planeColor)
                        createImpactDecal([position.x, .1, position.z], 3)
                    })
                }
            } else {
                data.currentSpeed = damp(data.currentSpeed, 0, 2.25, delta)
                position.y = (bottomY + .5 / 2)
            }
        } else if (moving) {
            let t = clamp(data.liftoffTimer / data.liftoffDuration, 0, 1)

            position.y = easeInOutCubic(t) * (targetY - startY) + startY
        }
    })

    // takeoff
    useFrame((state, delta) => {
        if (takeoffAt > position.z && moving) {
            data.liftoffTimer += delta * 1000
        }
    })

    return (
        <>
            <PlaneModel
                rotation={data.rotation}
                position={position}
                ref={planeRef}
                moving={moving}
                disabled={health === 0}
            />

            <DebugBox
                size={size}
                position={position}
                dynamic
            />
        </>
    )
}

export default memo(Plane)