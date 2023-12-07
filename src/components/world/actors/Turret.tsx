import { memo, startTransition, useLayoutEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { useInstance } from "../../InstancedMesh"
import { clamp, ndelta, setColorAt, setMatrixAt } from "../../../data/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../World"
import { Owner, Turret } from "../../../data/types"
import Config from "../../../data/Config"
import { Tuple3 } from "../../../types"
import { createBullet, damageTurret, removeTurret } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { createExplosion, createParticles, createShimmer } from "../../../data/store/effects"
import { explosionColor, turretColor, turretParticleColor } from "../../../data/theme" 
import { setLastImpactLocation } from "../../../data/store/player"
import { useBulletCollision } from "../../../data/collisions"

function explode(position: Vector3, size: Tuple3) {
    createShimmer({
        position: [
            position.x,
            position.y + size[1] / 2,
            position.z,
        ],
        size: [3, 4, 3]
    })
    createExplosion({
        position: [position.x, 0, position.z],
        count: 16,
        radius: random.float(.6, .7),
        shockwave: false,
    })
    createParticles({
        position: [position.x, 0, position.z],
        positionOffset: [[-1, 1], [0, 2], [-1, 1]],
        speed: [6, 22],
        speedOffset: [[-10, 10], [0, 5], [-10, 10]],
        normal: [0, 1, 0],
        count: [8, 12],
        radius: [.1, .5],
        color: turretParticleColor,
    })
}

function Turret({ id, size, position, health, fireFrequency, rotation, aabb }: Turret) {
    let removed = useRef(false)
    let { viewport } = useThree()
    let [index, instance] = useInstance("turret", {
        color: turretColor,
    })
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let shootTimer = useRef(0)
    let offset = useRef(0)
    let nextShotAt = useRef(fireFrequency)
    let remove = () => {
        setTimeout(() => removeTurret(id), 350)
        removed.current = true
    }

    useBulletCollision({
        name: "bulletcollision:turret",
        handler: ({ detail: { bullet, intersection, client } }) => {
            if (bullet.owner !== Owner.PLAYER || client.data.id !== id) {
                return
            } 

            if (intersection) {
                setLastImpactLocation(...intersection)
                createParticles({
                    position: intersection ,
                    positionOffset: [[0, 0], [0, 0], [0, 0]],
                    count: [1, 2],
                    speed: [11, 22],
                    speedOffset: [[-5, 5], [0, 0], [-5, 5]],
                    normal: [0, 0, -1],
                    normalOffset: [[0, 0], [0, 0], [0, 0]],
                    color: "white"
                })
            }

            damageTurret(id, bullet.damage)
        }
    })

    useFrame(() => {
        if (instance && typeof index === "number") {
            offset.current *= .85

            setMatrixAt({
                instance,
                rotation: [0, -rotation + Math.PI * .5, 0],
                index,
                position: [
                    position.x + random.float(-.125, .125) * offset.current,
                    position.y - .1,
                    position.z + random.float(-.125, .125) * offset.current,
                ]
            })
        }

    })

    useEffect(() => {
        if (health !== 100 && instance && typeof index === "number") {
            offset.current = 1

            return animate({
                from: explosionColor,
                to: turretColor,
                duration: 200,
                render(color) {
                    setColorAt(instance, index as number, color)
                },
            })
        }
    }, [instance, health, index])

    useLayoutEffect(() => {
        if (health === 0) {
            startTransition(() => {
                remove()
                explode(position, size)
            })
        }
    }, [health])

    // shooting
    useFrame((state, delta) => {
        let { player: { object: playerObject }, world } = store.getState()
        let canShoot = world.frustum.containsPoint(position)

        if (shootTimer.current > nextShotAt.current && canShoot && playerObject) {
            let playerPosition = playerObject.position
            let distanceFromPlayer = 1 - clamp(Math.abs(playerPosition.z - playerPosition.z) / (diagonal / 2), 0, 1)
            let heightPenalty = clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)

            let offsetRadius = size[0] + 1.25
            let offsetx = Math.cos(rotation) * offsetRadius
            let offsetz = Math.sin(rotation) * offsetRadius
            let bulletSpeed = 18

            startTransition(() => {
                createBullet({
                    position: [
                        position.x + offsetx,
                        position.y + size[1] / 2 - .15,
                        position.z + offsetz
                    ],
                    damage: 5,
                    speed: bulletSpeed,
                    rotation: rotation,
                    owner: Owner.ENEMY
                })
            })

            shootTimer.current = 0
            nextShotAt.current = fireFrequency * random.float(.75, 1) - fireFrequency * distanceFromPlayer * .5 + heightPenalty * fireFrequency * 2
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    useFrame(() => {
        let { world, player } = useStore.getState()
        let outsideFrustum = !world.frustum.intersectsBox(aabb) && player.object && position.z < player.object.position.z

        if (!removed.current && outsideFrustum) {
            startTransition(remove)
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

export default memo(Turret)