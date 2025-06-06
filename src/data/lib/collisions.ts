import { Bullet, CollisionObjectType } from "@data/types"
import { Box3, Ray, Vector3 } from "three"
import { Client, SpatialHashGrid3D } from "./SpatialHashGrid3D"
import { Tuple3 } from "src/types.global"
import { store } from "@data/store"

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
    direction: Vector3
}

export function getIntersection(box: BoxParams, ray: RayParams): Tuple3 {
    _box3.setFromCenterAndSize(_center.set(...box.position), _size.set(...box.size))
    _origin.copy(ray.position)
        .add(_offset.copy(ray.direction).multiplyScalar(-2))
    _ray.set(_origin, _direction.copy(ray.direction))

    // fallback to offscreen :/
    return _ray.intersectBox(_box3, _intersection)?.toArray() || [0, 0, -1_000]
}

export function getBulletCollisions(bullet: Bullet) {
    let grid = store.getState().world.grid
    let near = grid.findNear(bullet.line.position.toArray(), [1.5, 1, 1.5])
    let collisions: Client[] = []

    for (let client of near) {
        _box1.setFromCenterAndSize(_center1.set(...client.position), _size1.set(...client.size))

        if (bullet.line.intersectsBox(_box1)) {
            collisions.push(client)

            break
        }
    }

    return collisions
}

export function dispatchCollisionEvent(detail: CollisionEventDetails) {
    window.dispatchEvent(
        new CustomEvent<CollisionEventDetails>("bulletcollision", {
            bubbles: false,
            cancelable: false,
            detail,
        })
    )
}