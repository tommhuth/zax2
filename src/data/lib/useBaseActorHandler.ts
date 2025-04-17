import { useFrame } from "@react-three/fiber"
import { useState, startTransition, useEffect, useLayoutEffect } from "react"
import { Tuple3 } from "src/types.global"
import { Vector3, Box3 } from "three"
import { Client } from "./SpatialHashGrid3D"
import { useStore } from "@data/store"

interface UseBaseActorHandlerOptions {
    health?: number
    client: Client
    position: Vector3
    keepAround?: boolean
    removeDelay?: number
    aabb?: Box3
    size?: Tuple3
    moving?: boolean
    remove: () => void
    destroy: (position: Vector3) => void
}

let _size = new Vector3()

export function useBaseActorHandler({
    health = Infinity,
    client,
    position,
    removeDelay = 0,
    keepAround = false,
    moving = false,
    aabb,
    size,
    remove,
    destroy,
}: UseBaseActorHandlerOptions) {
    let [shouldExit, setShouldExit] = useState(false)

    // actor frustum exit
    useFrame(() => {
        let { player, world } = useStore.getState()
        let outsideFrustum = player.object && position.z < player.object.position.z - world.diagonal * .85

        if (!shouldExit && outsideFrustum) {
            startTransition(() => setShouldExit(true))
        }
    })

    // update aabb and client
    useFrame(() => {
        let { world } = useStore.getState()

        if (health > 0 && moving) {
            client.position = position.toArray()
            world.grid.updateClient(client)
        }

        if (aabb && size && moving) {
            aabb.setFromCenterAndSize(position, _size.set(...size))
        }
    })

    // actor component unmount
    useEffect(() => {
        return () => {
            let { world } = useStore.getState()

            world.grid.removeClient(client)
        }
    }, [client])

    // actor should exit from shouldExit with timeout
    useEffect(() => {
        if (shouldExit) {
            setTimeout(() => startTransition(remove), removeDelay)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldExit, removeDelay])

    // health 0, trigger destory effect
    useLayoutEffect(() => {
        if (health <= 0) {
            startTransition(() => {
                let { world } = useStore.getState()

                world.grid.removeClient(client)
                destroy(position)
                setShouldExit(!keepAround)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [health, client, keepAround, position])
}