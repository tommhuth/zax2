import { useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { useRef, useEffect, startTransition } from "react"
import { CollisionEventDetails, getCollisions } from "./collisions"
import { Client, ClientData } from "./SpatialHashGrid3D"
import { CollisionObjectType } from "@data/types"

interface BulletActions extends Partial<Record<CollisionObjectType, (data: ClientData, otherClient: Client, delta: number) => void>> {
    bullet?: (e: CollisionEventDetails) => void
}

interface UseCollisionDetectionParams extends BulletActions {
    interval?: number
    client?: Client // test collisions against this
    active?: () => boolean
}

export default function useCollisionDetection({
    interval = 1,
    client,
    active = () => true,
    ...actions
}: UseCollisionDetectionParams) {
    let grid = useStore(i => i.world.grid)
    let tick = useRef(0)
    let types = Object.keys(actions)

    useEffect(() => {
        if (!actions.bullet || !active()) {
            return
        }

        let onBulletCollision = ({ detail }: CustomEvent<CollisionEventDetails>) => {
            if (detail.client === client) {
                startTransition(() => actions.bullet?.(detail))
            }
        }

        window.addEventListener("bulletcollision", onBulletCollision as EventListener)

        return () => {
            window.removeEventListener("bulletcollision", onBulletCollision as EventListener)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions.bullet, active, client])

    useFrame((state, delta) => {
        if (active() && tick.current % interval === 0 && client) {
            let collisions = getCollisions({
                grid,
                position: client.position,
                size: client.size,
            })

            for (let i = 0; i < collisions.length; i++) {
                let otherClient = collisions[i]
                let action = actions[otherClient.data.type]

                if (!types.includes(otherClient.data.type) || otherClient === client) {
                    continue
                }

                startTransition(() => action?.(otherClient.data, otherClient, delta))
            }
        }

        tick.current++
    })
}