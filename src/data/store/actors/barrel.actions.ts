import { Tuple3 } from "../../../types.global"
import { store } from ".."
import { Barrel } from "../../types"
import { Box3, Vector3 } from "three"
import random from "@huth/random"
import { updateWorld } from "../utils"

interface CreateBarrelParams {
    position: Tuple3
    size?: Tuple3
    health?: number
    rotation?: number
}

export function createBarrel({
    position: [x = 0, y = 0, z = 0] = [0, 0, 0],
    rotation = 0,
}: CreateBarrelParams) {
    let id = random.id()
    let size = [2, 1.85, 2] as Tuple3
    let position = new Vector3(x, y + size[1] / 2, z)
    let aabb = new Box3().setFromCenterAndSize(new Vector3(z, y, z), new Vector3(...size))
    let { instances, world: { grid, barrels } } = store.getState()
    let client = grid.createClient(position.toArray(), [...size], { type: "barrel", id })

    updateWorld({
        barrels: [
            {
                position,
                id,
                client,
                health: 100,
                index: instances.line.index.next(),
                aabb,
                size,
                rotation,
            },
            ...barrels,
        ]
    })

    return id
}

export function damageBarrel(id: string, damage: number) {
    let barrels = store.getState().world.barrels
    let barrel = barrels.find(i => i.id === id) as Barrel
    let health = Math.max(barrel.health - damage, 0)

    updateWorld({
        barrels: [
            ...barrels.filter(i => i.id !== id),
            {
                ...barrel,
                health
            }
        ]
    })

    return health === 0
}

export function removeBarrel(id: string) {
    let { world: { barrels } } = store.getState()

    updateWorld({
        barrels: barrels.filter(i => i.id !== id)
    })
} 