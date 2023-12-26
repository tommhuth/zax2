import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { Bullet, CollisionObjectType } from "../../data/types"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../data/utils"
import { store } from "../../data/store"
import { removeBullet } from "../../data/store/actors"
import { getIntersection, getCollisions, CollisionEventDetails } from "../../data/collisions"
import { Tuple3 } from "../../types" 

function createCollisionEvent(
    type: CollisionObjectType,
    detail: CollisionEventDetails
) {
    return new CustomEvent<CollisionEventDetails>("bulletcollision:" + type, {
        bubbles: false,
        cancelable: false,
        detail,
    })
}


function BulletHandler() {
    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, frustum }, player } = store.getState()
        let removedBullets: Bullet[] = []

        if (!instances.line || !player.object || !instances.device) {
            return
        }

        for (let bullet of bullets) {  
            let collisions = getCollisions({
                grid,
                source: {
                    position: bullet.position,
                    size: bullet.obb,
                }
            })

            for (let client of collisions) {
                let intersection = getIntersection(client, bullet)

                window.dispatchEvent(
                    createCollisionEvent(client.data.type, {
                        client,
                        bullet,
                        intersection,
                        normal: bullet.direction.map(i  => i * -1) as Tuple3, 
                    })
                )

                break
            }

            bullet.position.x += bullet.direction[0] * bullet.speed * ndelta(delta)
            bullet.position.z += bullet.direction[2] * bullet.speed * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: bullet.position.toArray(),
                rotation: [0, bullet.rotation + Math.PI * .5, 0],
                scale: [bullet.size[0], .1, bullet.size[2] ]
            })

            if (!frustum.containsPoint(bullet.position) || collisions.length) {
                removedBullets.push(bullet)
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }
        }

        for (let bullet of removedBullets) {
            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removedBullets.length) {
            startTransition(() => removeBullet(...removedBullets.map(i => i.id)))
        }
    })

    return null
}

export default memo(BulletHandler)