import random from "@huth/random"
import { store } from "../index"
import { Box3, Vector3 } from "three"
import { updateWorld } from "../utils"
import { Plane } from "@data/types"
import { Tuple3 } from "src/types.global"

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

export function createPlane({
    position: [x, y, z],
    targetY = y,
    rotation = 0,
    speed = random.float(4, 5),
    fireFrequency = random.integer(150, 350),
}: CreatePlaneParams) {
    let id = random.id()
    let size = [1, 1.5, 2] as Tuple3
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