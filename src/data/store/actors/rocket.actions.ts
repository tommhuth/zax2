import random from "@huth/random"
import { store } from "../index"
import { Plane } from "../../types"
import { Box3, Vector3 } from "three"
import { Tuple3 } from "../../../types.global"
import { updateWorld } from "../utils"

export function removeRocket(id: string) {
    let { rockets } = store.getState().world

    updateWorld({
        rockets: rockets.filter(i => i.id !== id)
    })
}

export function damageRocket(id: string, damage: number) {
    let rockets = store.getState().world.rockets
    let rocket = rockets.find(i => i.id === id) as Plane
    let health = Math.max(rocket.health - damage, 0)

    updateWorld({
        rockets: [
            ...rockets.filter(i => i.id !== id),
            {
                ...rocket,
                health,
            }
        ]
    })

    return health === 0
}

export function createRocket(
    [x = 0, y = 0, z = 0]: Tuple3,
) {
    let id = random.id()
    let size = [.75, 3, .75] as Tuple3
    let position = new Vector3(x, y - size[1], z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, rockets } = store.getState().world
    let client = grid.createClient(
        position.toArray(),
        [...size],
        { type: "rocket", id }
    )

    updateWorld({
        rockets: [
            ...rockets,
            {
                id,
                position,
                aabb,
                client,
                size,
                health: 100
            }
        ]
    })

    return id
}