import random from "@huth/random"
import { store } from "../index"
import { Box3, Vector3 } from "three"
import { updateWorld } from "../utils"
import { Plane } from "@data/types"
import { Tuple3 } from "src/types.global"
import { WORLD_TOP_EDGE } from "@data/const"

export function damagePlane(id: string, damage: number) {
    let planes = store.getState().world.planes
    let plane = planes.find(i => i.id === id) as Plane
    let health = Math.max(plane.health - damage, 0)

    updateWorld({
        planes: [
            ...planes.filter(i => i.id !== id),
            {
                ...plane,
                health,
            }
        ]
    })

    return health === 0
}

export function removePlane(id: string) {
    let { world: { planes } } = store.getState()

    updateWorld({
        planes: planes.filter(i => i.id !== id)
    })
}

interface CreatePlaneParams {
    position: Tuple3
    targetY?: number
    speed?: number
    fireFrequency?: number
    rotation?: number
}

const size: Tuple3 = [1.5, 1.25, 2]

export function createPlane({
    position: [x, y, z],
    rotation = 0,
    targetY = rotation === 0 ? WORLD_TOP_EDGE : y,
    speed = rotation === 0 ? 3 : 0,
    fireFrequency = random.integer(500, 750),
}: CreatePlaneParams) {
    let id = random.id()
    let position = new Vector3(x, y, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, planes } = store.getState().world
    let client = grid.createClient(
        position.toArray(),
        [...size],
        { type: "plane", id }
    )

    updateWorld({
        planes: [
            {
                position,
                size,
                health: 100,
                fireFrequency,
                id,
                rotation,
                takeoffAt: position.z - random.float(4, 6),
                targetY,
                startY: y,
                speed,
                aabb,
                client,
            },
            ...planes,
        ]
    })

    return id
}