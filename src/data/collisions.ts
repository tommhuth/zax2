import { useFrame } from "@react-three/fiber"
import { startTransition, useEffect, useRef } from "react"
import { Box3, Ray, Vector3 } from "three"
import { SpatialHashGrid3D, Client, ClientData } from "./SpatialHashGrid3D"
import { useStore } from "./store"
import { Tuple3 } from "../types.global"
import { Bullet, CollisionObjectType } from "./types"
import { BULLET_SIZE } from "./const"

interface BulletActions extends Partial<Record<CollisionObjectType, (data: ClientData, otherClient: Client, delta: number) => void>> {
    bullet?: (e: CollisionEventDetails) => void
}

let _box1 = new Box3()
let _box2 = new Box3()
let _size1 = new Vector3()
let _size2 = new Vector3()
let _center1 = new Vector3()
let _center2 = new Vector3()

interface GetCollisionsParam {
    grid: SpatialHashGrid3D
    position: Tuple3
    size: Tuple3
}

export function getCollisions({
    grid,
    position,
    size,
}: GetCollisionsParam) {
    let near = grid.findNear(position, size)
    let result: Client[] = []

    for (let i = 0; i < near.length; i++) {
        let client = near[i]

        _box1.setFromCenterAndSize(_center1.set(...client.position), _size1.set(...client.size))
        _box2.setFromCenterAndSize(_center2.set(...position), _size2.set(...size))

        if (_box1.intersectsBox(_box2)) {
            result.push(client)
        }
    }

    return result
}

interface UseCollisionDetectionParams extends BulletActions {
    interval?: number
    client?: Client // test collisions against this
    active?: () => boolean
}

export function useCollisionDetection({
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
    }, [actions.bullet, active])

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
    _origin.y += Math.sign(_origin.y - box.position[1]) * BULLET_SIZE[1] / 2
    _ray.set(_origin, _direction.set(...ray.direction))

    let intersection = _ray.intersectBox(_box3, _intersection)

    // fallback to infinity offscreen :/
    return intersection ? intersection.toArray() : [0, 0, -Infinity]
}