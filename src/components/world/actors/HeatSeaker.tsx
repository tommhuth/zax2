import { Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { useFrame } from "@react-three/fiber"
import { removeHeatSeaker } from "../../../data/store/boss"
import { ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { startTransition, useEffect, useMemo, useRef } from "react"
import { createExplosion, createImpactDecal, createParticles } from "../../../data/store/effects"
import random from "@huth/random"
import type { HeatSeaker } from "../../../data/types"
import { useCollisionDetection } from "../../../data/collisions"
import { floorBaseColor, floorHiColor } from "@data/theme"
import { Tuple3 } from "src/types.global"

let _direction = new Vector3()

export default function HeatSeaker({
    position,
    index,
    size,
    client,
    id,
    velocity,
    generateSmoke
}: HeatSeaker & { generateSmoke: (position: Tuple3) => void }) {
    let grid = useStore(i => i.world.grid)
    let accuracy = useMemo(() => random.float(.25, .4), [])
    let time = useRef(0)
    let nextSmokeAt = useRef(random.integer(16, 35))

    useCollisionDetection({
        client,
        bullet: ({ bullet }) => {
            if (bullet.owner === "player") {
                removeHeatSeaker(id)
            }
        }
    })

    useFrame(() => {
        let { world: { frustum }, boss } = store.getState()

        if (
            (!frustum.containsPoint(position) && boss.pauseAt < position.z)
            || position.x > 10
            || position.x < -10
            || position.y > 50
            || position.y < .45
        ) {
            startTransition(() => {
                removeHeatSeaker(id)

                if (position.y < 1.5) {
                    createImpactDecal([position.x, .05, position.z], random.float(1.5, 2))
                    createParticles({
                        position: position.toArray(),
                        count: random.integer(6, 10),
                        normal: [0, 1, 0],
                        speed: [8, 25],
                        spread: [[-1, 1], [0, 1]],
                        color: [floorBaseColor, floorHiColor]
                    })
                }
            })
        }
    })

    useFrame((state, delta) => {
        let { player, world, instances } = store.getState()
        let speed = 10
        let nd = ndelta(delta)

        if (!player.object) {
            return
        }

        _direction.copy(position)
            .sub(player.object.position)
            .normalize()
            .multiplyScalar(-accuracy)

        velocity.x += _direction.x * nd * 4
        velocity.y += _direction.y * nd * 4
        velocity.z += _direction.z * nd * 4

        velocity.normalize()

        position.x += speed * velocity.x * nd
        position.y += speed * velocity.y * nd
        position.z += speed * velocity.z * nd

        setMatrixAt({
            instance: instances.sphere.mesh,
            index,
            position: position.toArray(),
            scale: size
        })

        client.position = position.toArray()
        world.grid.updateClient(client)
    })

    useFrame((state, delta) => {
        let fps = 1 / ndelta(delta) / 1000

        if (time.current > nextSmokeAt.current) {
            time.current = 0
            nextSmokeAt.current = random.integer(fps * 1.1, fps * 1.35)

            generateSmoke([
                position.x + random.integer(-.5, .5) - velocity.x * .25,
                position.y + random.integer(-.35, .35) - velocity.y * .25,
                position.z + random.integer(-.5, .5) - velocity.z * .25,
            ])
        }

        time.current += ndelta(delta) * 1000
    })

    useEffect(() => {
        return () => {
            let { instances } = store.getState()

            grid.removeClient(client)
            setMatrixNullAt(instances.sphere.mesh, index)
            startTransition(() => {
                createExplosion({
                    position: position.toArray(),
                    shockwave: false,
                    radius: random.float(.45, .55)
                })
            })
        }
    }, [index, grid, client, position])

    return null
}