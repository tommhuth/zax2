import { startTransition, useLayoutEffect, useMemo, useRef } from "react"
import { Rocket } from "../../../data/types"
import { useInstance } from "../../InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { Mesh, Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { WORLD_TOP_EDGE } from "../World"
import Config from "../../../data/Config"
import { useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { removeRocket } from "../../../data/store/actors"
import { createExplosion, createParticles, createShimmer } from "../../../data/store/effects"

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
            speedOffset: [[-5, 5], [0, 5], [-5, 5]],
            positionOffset: [[-.5, .5], [0, 1], [-.5, .5]],
            normal: [0, 1, 0],
            normalOffset: [[-.5, .5], [0, 0], [-.5, .5]],
            count: [10, 15],
            radius: [.1, .45],
            color: "#fff",
        })

        createExplosion({
            position: [position.x, 0, position.z],
            count: 10,
            radius: random.float(.65, .75),
            fireballCount: 5,
            fireballPath: [[position.x, 0, position.z], [0, 7, 0]]
        })
    } else {
        let explosions: [delay: number, offset: Tuple3, radius: number][] = [
            [125, [.2, size[1] / 2 - .2, .3], .2],
            [0, [-.2, -size[1] / 2, -.25], .35]
        ] 

        for (let [delay, [x, y, z], radius] of explosions) {
            setTimeout(() => {
                createExplosion({
                    position: [position.x + x, position.y + y, position.z + z],
                    count: 10,
                    radius,
                })
            }, delay)
        }

        setTimeout(() => {
            createExplosion({
                position: [position.x, position.y, position.z],
                count: 16,
                radius: random.float(.6, .8),
            }) 

            createParticles({
                position: position.toArray(),
                speed: [5, 20],
                speedOffset: [[-0, 0], [-0, 0], [-0, 0]],
                positionOffset: [[-.5, .5], [-1, 1], [-.5, .5]],
                normal: [0, 0, 0],
                normalOffset: [[-1, 1], [-1, 1], [-1, 1]],
                count: [10, 15],
                radius: [.1, .45],
                color: "#fff",
            })
        }, 320)
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
    let remove = () => {
        data.removed = true
        increaseScore(500)
        removeRocket(id)
        setMatrixNullAt(rocketInstance, rocketIndex as number)
    }

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

    useFrame((state, delta) => {
        let { player } = useStore.getState()
        let d = ndelta(delta)

        if (rocketInstance && typeof rocketIndex === "number" && !data.removed && player.object) {
            if (Math.abs(position.z - player.object.position.z) < data.triggerZ) {
                position.y += data.speed * d

                if (health === 0) {
                    data.speed -= .1
                } else if (position.y > WORLD_TOP_EDGE + 2) {
                    data.speed += .75
                } else {
                    data.speed += .01
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
            <meshBasicMaterial wireframe color="orange" />
        </mesh>
    )
}