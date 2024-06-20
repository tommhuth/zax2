import { Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { useFrame } from "@react-three/fiber"
import { removeHeatSeaker } from "../../../data/store/boss"
import { ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { startTransition, useEffect, useMemo } from "react"
import { createExplosion, createImpactDecal } from "../../../data/store/effects"
import random from "@huth/random"
import type { HeatSeaker } from "../../../data/types"
import { useCollisionDetection } from "../../../data/collisions"

let _dir = new Vector3()

export default function HeatSeaker({
    position,
    index,
    size,
    client,
    id,
    velocity
}: HeatSeaker) {
    let grid = useStore(i => i.world.grid)
    let accuracy = useMemo(() => random.float(.25, .4), [])

    useCollisionDetection({
        client,
        bullet: ({ bullet }) => {
            if (bullet.owner === "player") {
                removeHeatSeaker(id)
            }
        }
    })

    useFrame(() => {
        let { frustum } = store.getState().world

        if (
            !frustum.containsPoint(position)
            || position.x > 10
            || position.x < -10
            || position.y > 100
            || position.y < .45
        ) {
            startTransition(() => {
                removeHeatSeaker(id)

                if (position.y < .45) {
                    createImpactDecal([position.x, .05, position.z], random.float(1.5, 2))
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

        _dir.copy(position)
            .sub(player.object.position)
            .normalize()
            .multiplyScalar(-accuracy)

        velocity.x += _dir.x * nd * 4
        velocity.y += _dir.y * nd * 4
        velocity.z += _dir.z * nd * 4

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

    useEffect(() => {
        return () => {
            let { instances } = store.getState()

            grid.remove(client)
            setMatrixNullAt(instances.sphere.mesh, index)
            startTransition(() => {
                createExplosion({
                    position: position.toArray(),
                    shockwave: false,
                    radius: random.float(.45, .55)
                })
            })
        }
    }, [index, grid])

    return null
}