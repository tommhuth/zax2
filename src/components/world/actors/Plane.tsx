import { memo, startTransition, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { useInstance } from "../../InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt } from "../../../data/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { useCollisionDetection } from "../../../data/hooks"
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../World"
import { Owner, Plane } from "../../../data/types"
import { createBullet, damageTurret, removePlane } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { damageBarrel } from "../../../data/store/world"
import { increaseScore } from "../../../data/store/player"
import { createExplosion, createParticles } from "../../../data/store/effects"

let _size = new Vector3()

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function explode(position: Vector3) {
    createExplosion({
        position: [position.x, position.y - 1, position.z],
        count: 10,
        radius: .4
    })
    createParticles({
        position: position.toArray(),
        speed: [12, 16],
        speedOffset: [[-5, 5], [0, 20], [-15, 5]],
        positionOffset: [[-.5, .5], [-.5, .5], [-.5, .5]],
        normal: [0, 0, -.5],
        count: [4, 8],
        radius: [.1, .45],
        color: "yellow",
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
    fireFrequency = 300,
    speed
}: Plane) {
    let data = useMemo(() => ({
        time: random.integer(-4000, -2000),
        removed: false,
        grounded: false,
        gravity: 0,
        actualSpeed: speed,
        rotation: [0, 0, 0] as Tuple3,
        tilt: random.float(0.001, 0.05),
        shootTimer: random.float(0, fireFrequency),
        nextShotAt: fireFrequency * .5,
        liftOffDuration: random.integer(5000, 7_000)
    }), [])
    let bottomY = 0
    let grid = useStore(i => i.world.grid)
    let [index, instance] = useInstance("box", { color: "yellow" })
    let remove = () => {
        removePlane(id)
        data.removed = true
    }

    useCollisionDetection({
        position,
        size,
        predicate() {
            return health === 0
        },
        source: {
            size,
            position,
        },
        actions: {
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
                to: "#ffff00",
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

        let distanceFromPlayer = 1 - clamp((-position.z - playerPosition.z) / 10, 0, 1)
        let heightPenalty = 1 - clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)
        let shootDisabled = position.z > playerPosition.z || !world.frustum.containsPoint(position)
        let canShoot = position.y > playerPosition.y - 3 && health > 0

        if (!shootDisabled && canShoot && data.shootTimer > data.nextShotAt + heightPenalty * fireFrequency * 4) {
            let bulletSpeed = 20

            startTransition(() => {
                createBullet({
                    position: [
                        position.x,
                        position.y,
                        position.z + 2
                    ],
                    damage: 15,
                    color: "red",
                    speed: bulletSpeed,
                    rotation: Math.PI * .5,
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

            position.z -= data.actualSpeed * ndelta(delta)
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

    useFrame((state, delta) => { 
        if (health === 0) {
            if (!data.grounded) {
                let nd = ndelta(delta)

                data.gravity += -.015 * 60 * nd
                position.y += data.gravity * 60 * nd
                data.rotation[0] += data.tilt * 60 * nd
                data.rotation[2] += data.tilt * .25 * 60 * nd
                data.grounded = position.y <= (bottomY + .5 / 2)
                data.actualSpeed *= .99

                if (data.grounded) {
                    startTransition(() => {
                        createExplosion({
                            position: [position.x, -.5, position.z],
                            count: 8,
                            radius: .3,
                            fireballCount: 5,
                            fireballPath: [[position.x, 0, position.z], [0, 0, 2]]
                        })
                    })
                }
            } else {
                data.actualSpeed *= .9
                position.y = (bottomY + .5 / 2)
            }
        } else { 
            let t = clamp(data.time / data.liftOffDuration, 0, 1)
            
            position.y = easeInOutCubic(t) * (targetY - startY) + startY
        }

        data.time += delta * 1000 
    })

    return null
}

export default memo(Plane)