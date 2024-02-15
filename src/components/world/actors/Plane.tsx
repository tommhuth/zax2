import { memo, startTransition, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { useInstance } from "../models/InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt } from "../../../data/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Tuple3 } from "../../../types" 
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../World"
import { Owner, Plane } from "../../../data/types"
import { createBullet, damagePlane, damageTurret, removePlane } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { damageBarrel } from "../../../data/store/world"
import { increaseScore } from "../../../data/store/player"
import { createExplosion, createImpactDecal, createParticles, createScrap } from "../../../data/store/effects"
import { planeColor } from "../../../data/theme"
import { useCollisionDetection } from "../../../data/collisions"
import { damp } from "three/src/math/MathUtils.js"

let _size = new Vector3()

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function explode(position: Vector3) {
    createExplosion({
        position: [position.x, position.y - 1, position.z],
        count: 16,
        radius: .55, 
    })
    createParticles({
        position: position.toArray(),
        speed: [12, 16], 
        spread: [[-1, 1], [-1, 1]],
        normal: [0, 0, 0],
        count: [4, 8],
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
    takeoffDistance,
    fireFrequency = 300,
    speed
}: Plane) {
    let data = useMemo(() => ({
        time: 0,
        removed: false,
        grounded: false,
        gravity: 0,
        actualSpeed: speed,
        rotation: [0, 0, 0] as Tuple3,
        tilt: random.float(0.001, 0.05),
        shootTimer: random.float(0, fireFrequency),
        nextShotAt: fireFrequency * .5,
        liftOffDuration: random.integer(3000, 5_000)
    }), [])
    let bottomY = 0
    let grid = useStore(i => i.world.grid)
    let [index, instance] = useInstance("box", { color: planeColor })
    let remove = () => {
        removePlane(id)
        data.removed = true
    } 

    useCollisionDetection({ 
        size,
        position, 
        actions: {
            bullet: ( { bullet, client, intersection, normal, type  }) => { 
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
                startTransition(() => damageTurret(data.id, 100))
            },
            barrel: (data) => {
                startTransition(() => damageBarrel(data.id, 100))
            },
        }
    })

    useEffect(() => {
        if (health && health !== 100 && instance && typeof index === "number") {
            return animate({
                from: "#FFFFFF",
                to: planeColor,
                duration: 200,
                render(color) {
                    setColorAt(instance, index as number, color)
                },
            })
        }
    }, [instance, health, index])

    useEffect(() => {
        if (health === 0) {
            startTransition(() => {
                increaseScore(500)
                explode(position)
            })
        }
    }, [health])

    // shoot
    useFrame((state, delta) => {
        let playerPosition = store.getState().player.object?.position
        let world = store.getState().world

        if (!playerPosition) {
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
                        position.x,
                        position.y,
                        position.z - 3
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
        }

        data.shootTimer += ndelta(delta) * 1000
    })

    // move
    useFrame((state, delta) => {
        if (instance && typeof index === "number" && !data.removed) {
            let { world, player } = useStore.getState()
            let playerZ = player.object?.position.z || -Infinity
            let shouldMoveForward = targetY === startY || position.z - 20 < playerZ

            position.z -= shouldMoveForward ? data.actualSpeed * ndelta(delta) : 0
            aabb.setFromCenterAndSize(position, _size.set(...size))

            setMatrixAt({
                instance,
                index,
                position: position.toArray(),
                scale: [size[0], .5, size[2]],
                rotation: data.rotation
            })

            if (!world.frustum.intersectsBox(aabb) && player.object && position.z < player.object.position.z) {
                startTransition(remove)
            } else {
                client.position = position.toArray()
                grid.updateClient(client)
            }
        }
    })

    // grounding
    useFrame((state, delta) => {
        if (health === 0) {
            if (!data.grounded) {
                let nd = ndelta(delta)

                data.gravity += .25 * nd
                position.y -= data.gravity * 60 * nd
                data.rotation[0] += data.tilt * .5 * 60 * nd
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
                        normal: [0,1,0],
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
        } else {
            let t = clamp(data.time / data.liftOffDuration, 0, 1)

            position.y = easeInOutCubic(t) * (targetY - startY) + startY
        }
    })

    // takeoff
    useFrame((state, delta)=> { 
        if (takeoffDistance > position.z) {
            data.time += delta * 1000
        }
    })

    return null
}

export default memo(Plane)