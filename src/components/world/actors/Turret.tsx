import { memo, startTransition, useLayoutEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { useInstance } from "../models/InstancedMesh"
import { clamp, ndelta, setColorAt } from "../../../data/utils"
import animate from "@huth/animate"
import random from "@huth/random"
import { Vector3 } from "three"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../World"
import { Owner, Turret } from "../../../data/types"
import Config from "../../../data/Config"
import { Tuple3 } from "../../../types"
import { createBullet, damageTurret, removeTurret } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { createExplosion, createImpactDecal, createParticles, createScrap, createShimmer } from "../../../data/store/effects"
import { explosionColor, turretColor, turretParticleColor } from "../../../data/theme"
import { useCollisionDetection } from "../../../data/collisions"

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
        position: [
            position.x,
            position.y - size[1] / 2,
            position.z,
        ],
        count: 14,
        radius: random.float(.6, .7), 
    })
    createParticles({
        position: position.toArray(), 
        speed: [14, 22],
        spread: [[-1, 1], [0, 1]],
        normal: [0, 1, 0],
        count: [8, 12],
        radius: [.1, .5],
        color: turretParticleColor,
    })
}

function Turret({ id, size, position, health, fireFrequency, rotation, aabb, floorLevel }: Turret) {
    let removed = useRef(false)
    let { viewport } = useThree()
    let [index, instance] = useInstance("turret", {
        color: turretColor,
        rotation: [0, -rotation + Math.PI * .5, 0],
        position: [
            position.x,
            position.y - .1,
            position.z,
        ]
    })
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
    let shootTimer = useRef(0)
    let nextShotAt = useRef(fireFrequency)
    let remove = () => {
        setTimeout(() => removeTurret(id), 350)
        removed.current = true
    }

    useCollisionDetection({
        actions: {
            bullet: ( { bullet, client, type   }) => {  
                if (bullet.owner !== Owner.PLAYER || client.data.id !== id || type !== "turret") {
                    return
                }
     
                damageTurret(id, bullet.damage)
            }
        }
    }) 

    useEffect(() => {
        if (health !== 100 && instance && typeof index === "number") {
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
                createImpactDecal([position.x, .1, position.z])
                createScrap([position.x, floorLevel, position.z], 2, turretColor)
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
                        position.y + size[1] / 2 - .5,
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

    if (!Config.DEBUG || false) {
        return null
    }

    return (
        <>
            <mesh position={position.toArray()}>
                <boxGeometry args={[...size, 1, 1, 1]} />
                <meshBasicMaterial wireframe color="orange" name="debug" />
            </mesh>
        </>
    )
}

export default memo(Turret)