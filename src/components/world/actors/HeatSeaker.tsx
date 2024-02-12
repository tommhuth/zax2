import { Frustum, Matrix4, Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { useFrame } from "@react-three/fiber"
import { removeHeatSeaker } from "../../../data/store/boss"
import { setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { useLayoutEffect, useMemo } from "react"
import { createExplosion, createImpactDecal } from "../../../data/store/effects"
import random from "@huth/random"
import { HeatSeaker } from "../../../data/types"
import { useCollisionDetection } from "../../../data/collisions"

let _dir = new Vector3()
let _mat4 = new Matrix4()
let _frustum = new Frustum()

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
        actions: {
            bullet: ( { bullet, type } ) => {
                if (bullet.owner === "player" || type !== "heatseaker") {
                    removeHeatSeaker(id)
                }
            }
        }
    })

    useFrame((state, delta) => {
        let { player, world, instances } = store.getState()
        let speed = 10

        if (!player.object) {
            return
        }

        _frustum.setFromProjectionMatrix(_mat4.multiplyMatrices(
            state.camera.projectionMatrix,
            state.camera.matrixWorldInverse
        ))

        if (
            !_frustum.containsPoint(position)
            || position.x > 10
            || position.x < -10
            || position.y > 100
            || position.y < .45
        ) {
            removeHeatSeaker(id)

            if ( position.y < .45 ) {
                createImpactDecal([position.x, .05, position.z], random.float(1.5, 2))
            }
        }

        _dir.copy(position)
            .sub(player.object.position)
            .normalize()
            .multiplyScalar(-accuracy)

        velocity.x += _dir.x * delta * 4
        velocity.y += _dir.y * delta * 4
        velocity.z += _dir.z * delta * 4

        velocity.normalize()

        position.x += speed * velocity.x * delta
        position.y += speed * velocity.y * delta
        position.z += speed * velocity.z * delta

        setMatrixAt({
            instance: instances.sphere.mesh,
            index,
            position: position.toArray(),
            scale: size
        })

        client.position = position.toArray()
        world.grid.updateClient(client)
    })

    useLayoutEffect(() => {
        return () => {
            let { instances } = store.getState()

            // must happen here at the very end and after any useFrame updates??
            grid.remove(client)
            setMatrixNullAt(instances.sphere.mesh, index)
            createExplosion({
                position: position.toArray(),
                shockwave: false,
                radius: random.float(.45, .55)
            })
        }
    }, [index, grid])

    return null
}