import random from "@huth/random"
import { store } from "../index"
import { Turret } from "../../types"
import { Box3, Vector3 } from "three"
import { Tuple3 } from "../../../types.global"
import { updateWorld } from "../utils"

export function removeTurret(id: string) {
    let { world: { turrets } } = store.getState()

    updateWorld({
        turrets: turrets.filter(i => i.id !== id)
    })
}

export function damageTurret(id: string, damage: number) {
    let { world } = store.getState()
    let turrets = world.turrets
    let turret = turrets.find(i => i.id === id) as Turret
    let health = Math.max(turret.health - damage, 0)

    updateWorld({
        turrets: [
            ...turrets.filter(i => i.id !== id),
            {
                ...turret,
                health,
            }
        ]
    })

    return health === 0
}

interface CreateTurretParam {
    fireFrequency?: number
    position: Tuple3
    rotation?: number
    floorLevel: number
}

export function createTurret({
    fireFrequency = random.integer(1500, 2200),
    position: [x, y, z],
    rotation = 0,
    floorLevel,
}: CreateTurretParam) {
    let id = random.id()
    let size = [1.85, 4.5, 1.85] as Tuple3
    let position = new Vector3(x, y, z)
    let aabb = new Box3().setFromCenterAndSize(position, new Vector3(...size))
    let { grid, turrets } = store.getState().world
    let client = grid.createClient(
        [x, y, z],
        [...size],
        { type: "turret", id }
    )

    updateWorld({
        turrets: [
            {
                position,
                fireFrequency,
                size,
                health: 100,
                rotation,
                floorAt: floorLevel,
                id,
                aabb,
                client,
            },
            ...turrets,
        ]
    })

    return id
}