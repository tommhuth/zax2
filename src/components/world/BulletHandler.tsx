import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { Box3, Ray, Vector3 } from "three"
import { Bullet } from "../../data/types"
import { Tuple3 } from "../../types"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../data/utils"
import { store } from "../../data/store"
import { removeBullet } from "../../data/store/actors"
import { getCollisions } from "../../data/collisions"

let _box3 = new Box3()
let _ray = new Ray()
let _center = new Vector3()
let _size = new Vector3()
let _origin = new Vector3()
let _direction = new Vector3()
let _intersection = new Vector3()

interface BoxParams {
    position: Tuple3
    size: Tuple3
}
interface RayParams {
    position: Vector3
    direction: Tuple3
}

function boxRayIntersection(box: BoxParams, ray: RayParams) {
    _box3.setFromCenterAndSize(_center.set(...box.position), _size.set(...box.size))
    _ray.set(_origin.copy(ray.position), _direction.set(...ray.direction))

    return _ray.intersectBox(_box3, _intersection)?.toArray()
}

function BulletHandler() {
    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, frustum }, player } = store.getState()
        let removed: Bullet[] = []

        if (!instances.line || !player.object || !instances.device) {
            return
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
            let bulletDiagonal = Math.sqrt((bullet.size[2] * .5) ** 2 + bullet.size[2] ** 2)
            let collisions = getCollisions({
                grid,
                source: {
                    position: bullet.position,
                    size: [bulletDiagonal, bullet.size[1], bulletDiagonal],
                }
            })
            let direction: Tuple3 = [
                Math.cos(bullet.rotation),
                0,
                Math.sin(bullet.rotation)
            ]

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]

                window.dispatchEvent(new CustomEvent("bulletcollision:" + client.data.type, {
                    bubbles: false,
                    cancelable: false,
                    detail: {
                        client,
                        bullet,
                        intersection: boxRayIntersection(client, {
                            direction,
                            position: bullet.position
                        })
                    }
                }))

                break
            }

            bullet.position.x += direction[0] * bullet.speed * ndelta(delta)
            bullet.position.z += direction[2] * bullet.speed * ndelta(delta)

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

        for (let i = 0; i < removed.length; i++) {
            let bullet = removed[i]

            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removed.length) {
            startTransition(() => removeBullet(...removed.map(i => i.id)))
        }
    })

    return null
}

export default memo(BulletHandler)