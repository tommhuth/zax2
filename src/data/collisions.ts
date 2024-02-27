import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Box3, Ray, Vector3 } from "three"
import { SpatialHashGrid3D, Client, ClientData } from "./world/SpatialHashGrid3D"
import { bulletSize, useStore } from "./store"
import { Tuple3 } from "../types"
import { Bullet, CollisionObjectType } from "./types"
   
interface BulletActions extends Partial<Record<CollisionObjectType, (data: ClientData) => void>> {
    bullet?: (e: CollisionEventDetails) => void
}
 
interface UseCollisionDetectionParams {
    interval?: number
    position?: Vector3
    size?: Tuple3
    when?: () => boolean
    actions: BulletActions
}


let _box1 = new Box3()
let _box2 = new Box3()
let _size1 = new Vector3()
let _size2 = new Vector3()
let _center1 = new Vector3()

interface GetCollisionsParam{
    grid: SpatialHashGrid3D
    position: Vector3
    size: Tuple3
}

export function getCollisions({
    grid, 
    position,
    size,
}: GetCollisionsParam) {
    let near = grid.findNear(position.toArray(), size)
    let result: Client[] = []

    for (let i = 0; i < near.length; i++) {
        let client = near[i]

        _box1.setFromCenterAndSize(_center1.set(...client.position), _size1.set(...client.size as Tuple3))
        _box2.setFromCenterAndSize(position, _size2.set(...size))

        if (_box1.intersectsBox(_box2)) {
            result.push(client)
        }
    }

    return result
}

export function useCollisionDetection({
    interval = 1, 
    position,
    size,
    actions,
    when = () => true,
}: UseCollisionDetectionParams) {
    let grid = useStore(i => i.world.grid)
    let tick = useRef(0)
    let types = Object.keys(actions)

    useEffect(() => { 
        if (!actions.bullet || !when()) {
            return 
        }

        let onBulletCollision = ({ detail }: CustomEvent<CollisionEventDetails>) => {
            actions.bullet?.(detail)
        }

        window.addEventListener("bulletcollision",  onBulletCollision as EventListener)

        return () => {
            window.removeEventListener("bulletcollision", onBulletCollision as EventListener)
        }
    }, [actions.bullet, when])

    useFrame(() => {
        if (when() && tick.current % interval === 0 && position && size) {
            let collisions = getCollisions({
                grid, 
                position,
                size,
            })

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]
                let action = actions[client.data.type]

                if (!types.includes(client.data.type)) {
                    continue
                }

                action?.(client.data)
            }
        }

        tick.current++
    })
}

export interface CollisionEventDetails {
    client: Client
    bullet: Bullet
    intersection: Tuple3
    normal: Tuple3
    type: CollisionObjectType
} 
 
let _box3 = new Box3()
let _ray = new Ray()
let _center = new Vector3()
let _size = new Vector3()
let _origin = new Vector3()
let _direction = new Vector3()
let _offset = new Vector3()
let _intersection = new Vector3() 

interface BoxParams {
    position: Tuple3
    size: Tuple3
}

interface RayParams {
    position: Vector3
    direction: Tuple3
}

export function getIntersection(box: BoxParams, ray: RayParams): Tuple3 {
    _box3.setFromCenterAndSize(_center.set(...box.position), _size.set(...box.size))
    _origin.copy(ray.position)
        .add(_offset.set(...ray.direction).multiplyScalar(-2))
    _origin.y += Math.sign(_origin.y - box.position[1]) * bulletSize[1] / 2
    _ray.set(_origin, _direction.set(...ray.direction))

    let intersection = _ray.intersectBox(_box3, _intersection)

    // fallback to infinity offscreen :/
    return intersection ? intersection.toArray() : [0, 0, -Infinity]
}