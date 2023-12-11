import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { Bullet } from "../../data/types"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../data/utils"
import { store } from "../../data/store"
import { removeBullet } from "../../data/store/actors"
import { boxRayIntersection, getCollisions } from "../../data/collisions"

function BulletHandler() {
    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, frustum }, player } = store.getState()
        let removed: Bullet[] = []

        if (!instances.line || !player.object || !instances.device) {
            return
        }

        for (let bullet of bullets) {
            let bulletDiagonal = Math.sqrt((bullet.size[2] * .5) ** 2 + bullet.size[2] ** 2)
            let collisions = getCollisions({
                grid,
                source: {
                    position: bullet.position,
                    size: [bulletDiagonal, bullet.size[1], bulletDiagonal],
                }
            })

            for (let client of collisions) {
                window.dispatchEvent(new CustomEvent("bulletcollision:" + client.data.type, {
                    bubbles: false,
                    cancelable: false,
                    detail: {
                        client,
                        bullet,
                        intersection: boxRayIntersection(client, bullet)
                    }
                }))

                break
            }

            bullet.position.x += bullet.direction[0] * bullet.speed * ndelta(delta)
            bullet.position.z += bullet.direction[2] * bullet.speed * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: [
                    bullet.position.x,
                    bullet.position.y - .2,
                    bullet.position.z,
                ],
                rotation: [0, bullet.rotation + Math.PI * .5, 0],
                scale: bullet.size,
            })

            if (!frustum.containsPoint(bullet.position) || collisions.length) {
                removed.push(bullet)
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }
        }

        for (let bullet of removed) {  
            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removed.length) {
            startTransition(() => removeBullet(...removed.map(i => i.id)))
        }
    })

    return null
}

export default memo(BulletHandler)