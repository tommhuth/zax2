import { startTransition, useEffect, useMemo, useRef, useState } from "react"
import type { Rocket } from "../../../data/types"
import { Owner } from "../../../data/types"
import { useFrame } from "@react-three/fiber"
import { ndelta } from "../../../data/utils"
import { Mesh, Vector3 } from "three"
import random from "@huth/random"
import { GLTFModel, Tuple3 } from "../../../types"
import { useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { damageRocket, removeRocket } from "../../../data/store/actors"
import { createExplosion, createParticles } from "../../../data/store/effects"
import { useCollisionDetection } from "../../../data/collisions"
import { rocketColor } from "../../../data/theme"
import Exhaust from "../../Exhaust"
import { WORLD_TOP_EDGE } from "../../../data/const"
import models from "@assets/models/rocket.glb"
import { useGLTF } from "@react-three/drei" 
import DebugBox from "@components/DebugBox"

let _size = new Vector3()

function explode(position: Vector3, size: Tuple3) {
    let shouldDoFireball = position.y < 2

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
        type ExplosionPart = [delay: number, offset: Tuple3, radius: number]
        let explosions: ExplosionPart[] = [
            [155, [.2, size[1] / 2 - .2, .3], .2],
            [20, [-.2, -size[1] / 2, -.25], .3],
            [0, [.2, -size[1] / 2, -.25], .2],
        ]

        for (let [delay, [x, y, z], radius] of explosions) {
            createExplosion({
                position: [position.x + x, position.y + y, position.z + z],
                count: 10,
                shockwave: true,
                radius,
                delay
            })
        }

        createExplosion({
            position: [position.x, position.y, position.z],
            count: 20,
            radius: random.float(.8, 1),
            delay: 520,
            secondaryFireballCount: 3
        })

        createParticles({
            position: position.toArray(),
            speed: [5, 20],
            normal: [0, 0, 0],
            spread: [[-1, 1], [-1, 1]],
            count: [10, 15],
            radius: [.1, .55],
            color: rocketColor,
            delay: 520
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
    let { nodes } = useGLTF(models) as GLTFModel<["rocket", "platform"]>
    let rocketRef = useRef<Mesh>(null)
    let grid = useStore(i => i.world.grid)
    let [removed, setRemoved] = useState(false)
    let data = useMemo(() => {
        return {
            removed: false,
            speed,
            triggerZ: 20,
            rotationY: random.float(0, Math.PI * 2)
        }
    }, [speed])
    let materials = useStore(i => i.materials)
    let remove = () => {
        data.removed = true
        increaseScore(500)
        setRemoved(true)
    }

    useEffect(() => {
        return () => {
            removeRocket(id)
        }
    }, [id])

    useCollisionDetection({
        actions: {
            bullet: ({ bullet, client, type }) => {
                if (
                    bullet.owner !== Owner.PLAYER
                    || client.data.id !== id
                    || type !== "rocket"
                ) {
                    return
                }

                damageRocket(id, bullet.damage)
            }
        }
    })

    useEffect(() => {
        if (health === 0) {
            startTransition(() => {
                setTimeout(() => startTransition(remove), 450)
                explode(position, size)
            })
        }
    }, [health])

    // movement
    useFrame((state, delta) => {
        let { player } = useStore.getState()
        let d = ndelta(delta)

        if (rocketRef.current && !data.removed && player.object) {
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

            rocketRef.current.position.copy(position)

            aabb.setFromCenterAndSize(position, _size.set(...size))
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    return (
        <>

            <mesh
                castShadow
                receiveShadow
                ref={rocketRef}
                rotation-y={data.rotationY}
                visible={!removed}
                dispose={null}
                geometry={nodes.rocket.geometry}
                material={materials.rocket}
            />
            <mesh
                castShadow
                receiveShadow
                dispose={null}
                geometry={nodes.platform.geometry}
                material={materials.platform}
                position={[position.x, 0, position.z]}
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