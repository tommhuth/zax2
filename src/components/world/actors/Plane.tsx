import { memo, startTransition, useMemo, useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { useEffect } from "react"
import { clamp, ndelta } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { Mesh, Vector3 } from "three"
import { Owner, Plane as PlaneType } from "../../../data/types"
import { createBullet, damagePlane, damageTurret, removePlane } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { damageBarrel } from "../../../data/store/world"
import { increaseScore } from "../../../data/store/player"
import { createExplosion, createImpactDecal, createParticles, createScrap } from "../../../data/store/effects"
import { planeColor } from "../../../data/theme"
import { useCollisionDetection } from "../../../data/collisions"
import { damp } from "three/src/math/MathUtils.js"
import Counter from "../../../data/world/Counter"
import { easeInOutCubic } from "../../../data/shaping"
import Exhaust from "../../Exhaust"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../../../data/const"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

import planeModel from "../../../../assets/models/plane.glb"
 
let _size = new Vector3()

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

useLoader.preload(GLTFLoader, planeModel)

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
    rotation = 0,
}: PlaneType) {
    let model = useLoader(GLTFLoader, planeModel)
    let materials = useStore(i => i.materials)
    let planeRef = useRef<Mesh>(null)
    let data = useMemo(() => ({
        removed: false,
        grounded: false,
        gravity: 0,
        actualSpeed: speed,
        rotation: [0, rotation + Math.PI, 0] as Tuple3,
        tilt: random.float(0.002, 0.05),
        shootTimer: random.float(0, fireFrequency),
        nextShotAt: fireFrequency * .5,
        liftoffDuration: 4_300,
        liftoffTimer: 0,
    }), [])
    let bottomY = 0
    let grid = useStore(i => i.world.grid)
    let weaponSide = useMemo(() => new Counter(2), [])
    let isStatic = speed === 0
    let diagonal = useStore(i => i.world.diagonal)
    let remove = () => {
        startTransition(() => removePlane(id))
        data.removed = true
    }   

    useCollisionDetection({
        client,
        actions: {
            bullet: ({ bullet, client, intersection, normal, type }) => {
                if (bullet.owner !== Owner.PLAYER || client.data.id !== id || type !== "plane") {
                    return
                }

                damagePlane(id, bullet.damage)
                createParticles({
                    position: intersection,
                    count: [1, 3],
                    speed: [8, 12],
                    offset: [[0, 0], [0, 0], [0, 0]],
                    spread: [[0, 0], [0, 0]],
                    normal,
                    color: "yellow",
                })
            },
            turret: (data) => {
                damageTurret(data.id, 100)
            },
            barrel: (data) => {
                damageBarrel(data.id, 100)
            },
        }
    })

    useEffect(() => {
        if (health === 0) {
            startTransition(() => {
                increaseScore(500)
                explode(position)

                if (isStatic) {
                    createImpactDecal([position.x, .1, position.z], 2.25)
                    setTimeout(remove, 240)
                }
            })
        }
    }, [health, isStatic])

    // shoot
    useFrame((state, delta) => {
        let playerPosition = store.getState().player.object?.position
        let world = store.getState().world

        if (!playerPosition || isStatic) {
            return
        }

        let distanceFromPlayer = 1 - clamp((-position.z - playerPosition.z) / 15, 0, 1)
        let heightPenalty = 1 - clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)
        let shootDisabled = position.z > playerPosition.z || !world.frustum.containsPoint(position)
        let canShoot = health > 0

        if (!shootDisabled && canShoot && data.shootTimer > data.nextShotAt + heightPenalty * fireFrequency) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x + (weaponSide.current === 1 ? -.8 : .8),
                        position.y,
                        position.z - 2
                    ],
                    damage: 10,
                    color: "#fff",
                    speed: 30,
                    rotation: -Math.PI * .5,
                    owner: Owner.ENEMY
                })
                data.shootTimer = 0
                data.nextShotAt = fireFrequency - fireFrequency * distanceFromPlayer * .5
            })
            weaponSide.next()
        }

        data.shootTimer += ndelta(delta) * 1000
    })

    // move
    useFrame((state, delta) => {
        if (planeRef.current && !data.removed && !isStatic) {
            let { world, player } = useStore.getState()
            let playerZ = player.object?.position.z || -Infinity
            let shouldMoveForward = targetY === startY || position.z - diagonal * 1.5 < playerZ

            position.z -= shouldMoveForward ? data.actualSpeed * ndelta(delta) : 0
            aabb.setFromCenterAndSize(position, _size.set(...size))

            planeRef.current.position.copy(position)
            planeRef.current.rotation.set(...data.rotation)

            if (
                !world.frustum.intersectsBox(aabb)
                && player.object
                && position.z < player.object.position.z
            ) {
                startTransition(remove)
            } else {
                client.position = position.toArray()
                grid.updateClient(client)
            }
        }
    })

    // grounding
    useFrame((state, delta) => {
        if (health === 0 && !isStatic) {
            if (!data.grounded) {
                let nd = ndelta(delta)

                data.gravity += .25 * nd
                position.y -= data.gravity * 60 * nd
                data.rotation[0] -= data.tilt * .5 * 60 * nd
                data.rotation[2] += data.tilt * .25 * 60 * nd
                data.actualSpeed = damp(data.actualSpeed, 0, .5, nd)
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
                }
            } else {
                data.actualSpeed = damp(data.actualSpeed, 0, 2.25, delta)
                position.y = (bottomY + .5 / 2)
            }
        } else if (!isStatic) {
            let t = clamp(data.liftoffTimer / data.liftoffDuration, 0, 1)

            position.y = easeInOutCubic(t) * (targetY - startY) + startY
        }
    })

    // takeoff
    useFrame((state, delta) => {
        if (takeoffAt > position.z && !isStatic) {
            data.liftoffTimer += delta * 1000
        }
    })

    return (
        <>
            <mesh
                castShadow
                receiveShadow
                rotation={data.rotation}
                position={position.toArray()}
                ref={planeRef}
                material={materials.plane}
                dispose={null}
            >
                <primitive
                    object={(model.nodes.plane as Mesh).geometry} 
                    attach="geometry"
                />
            </mesh>

            {!isStatic && (
                <Exhaust
                    targetPosition={position}
                    offset={[0, .35, 2]}
                    scale={[.4, .2, .9]}
                    rotation={[0, -Math.PI, 0]}
                    visible={health > 0}
                /> 
            )}
        </>
    )
}

export default memo(Plane)