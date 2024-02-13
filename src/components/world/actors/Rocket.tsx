import { startTransition, useLayoutEffect, useMemo, useRef } from "react"
import { Owner, Rocket } from "../../../data/types"
import { useInstance } from "../models/InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { Mesh, Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { WORLD_TOP_EDGE } from "../World"
import Config from "../../../data/Config"
import { useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { damageRocket, removeRocket } from "../../../data/store/actors"
import { createExplosion, createParticles, createShimmer } from "../../../data/store/effects"
import { useCollisionDetection } from "../../../data/collisions"
import { rocketColor } from "../../../data/theme"

let _size = new Vector3()

function explode(position: Vector3, size: Tuple3) {
    let shouldDoFireball = position.y < 2

    createShimmer({
        position: [
            position.x,
            position.y + size[1] / 2,
            position.z,
        ],
        count: [30, 50],
        size: [3, 6, 3]
    })

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
            radius: random.float(.65, .75),
            fireballCount: 8,
            fireballPath: [[position.x, 0, position.z], [0, 6, 0]]
        })
    } else {
        type ExplosionPart = [delay: number, offset: Tuple3, radius: number]
        let explosions: ExplosionPart[] = [
            [125, [.2, size[1] / 2 - .2, .3], .2],
            [0, [-.2, -size[1] / 2, -.25], .3]
        ]

        for (let [delay, [x, y, z], radius] of explosions) { 
            createExplosion({
                position: [position.x + x, position.y + y, position.z + z],
                count: 10,
                shockwave: false,
                radius,
                delay
            }) 
        }
 
        createExplosion({
            position: [position.x, position.y, position.z],
            count: 20,
            radius: random.float(.8, 1),
            delay: 320
        })

        createParticles({
            position: position.toArray(),
            speed: [5, 20],  
            normal: [0, 0, 0],
            spread: [[-1, 1], [-1, 1]],
            count: [10, 15],
            radius: [.1, .55],
            color: rocketColor,
            delay: 320
        }) 
    }
}

export default function Rocket({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    client,
    speed,
    health,
}: Rocket) {
    let grid = useStore(i => i.world.grid)
    let data = useMemo(() => {
        return { removed: false, speed, triggerZ: 25, rotationY: random.float(0, Math.PI * 2) }
    }, [speed])
    let ref = useRef<Mesh>(null)
    let [rocketIndex, rocketInstance] = useInstance("rocket", { reset: false, color: "#FFF" })
    let [exhaustIndex, exhaustInstance] = useInstance("exhaust", { color: "#FFF" })
    let remove = () => {
        data.removed = true
        increaseScore(500)
        removeRocket(id)
        setMatrixNullAt(rocketInstance, rocketIndex as number)
    }

    useCollisionDetection({
        actions: {
            bullet: ( { bullet, client, type }  ) => {
                if (bullet.owner !== Owner.PLAYER || client.data.id !== id || type !== "rocket") {
                    return
                }
    
                damageRocket(id, bullet.damage) 
            }
        }
    }) 

    useInstance("platform", {
        color: "#ddd",
        reset: false,
        position: [position.x, 0, position.z],
        rotation: [0, random.float(0, Math.PI * 2), 0]
    })

    useLayoutEffect(() => {
        if (health === 0) {
            startTransition(() => {
                setTimeout(() => remove(), 450)
                explode(position, size)
            })
        }
    }, [health])

    useFrame(() => {
        if (typeof exhaustIndex === "number") {
            setMatrixAt({
                instance: exhaustInstance,
                index: exhaustIndex,
                scale: [
                    .5 + random.float(-.15, .15),
                    1.25 + random.float(-.4, .4),
                    .5 + random.float(-.15, .15)
                ],
                position: [
                    position.x,
                    position.y - size[1] / 2 - 1.1,
                    position.z,
                ]
            })
        }
    })

    useFrame((state, delta) => {
        let { player } = useStore.getState()
        let d = ndelta(delta)

        if (rocketInstance && typeof rocketIndex === "number" && !data.removed && player.object) {
            if (Math.abs(position.z - player.object.position.z) < data.triggerZ) {
                position.y += data.speed * d

                if (health === 0) {
                    data.speed -= .1 * 60 * d
                } else if (position.y > WORLD_TOP_EDGE + 2) {
                    data.speed += .75 * 60 * d
                } else {
                    data.speed += .01 * 60 * d
                }
            }

            aabb.setFromCenterAndSize(position, _size.set(...size))
            setMatrixAt({
                instance: rocketInstance,
                index: rocketIndex,
                position: position.toArray(),
                rotation: [0, data.rotationY, 0]
            })

            ref.current?.position.copy(position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    if (!Config.DEBUG) {
        return null
    }

    return (
        <mesh position={position.toArray()} ref={ref}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" name="debug" />
        </mesh>
    )
}