import { Tuple3 } from "../../types.global"
import { store } from "."
import { Barrel, WorldPart } from "../types"
import { Box3, Vector3 } from "three"
import random from "@huth/random"
import { updateWorld } from "./utils"
import { getNextWorldPart } from "../world/getNextWorldPart"

export function setLastImpactLocation(x: number, y: number, z: number) {
    store.setState({
        world: {
            ...store.getState().world,
            lastImpactLocation: [x, y, z]
        },
    })

}

export function setDiagonal(diagonal: number) {
    store.setState({
        world: {
            ...store.getState().world,
            diagonal
        },
    })

}
export function setTimeScale(timeScale: number) {
    store.setState({
        world: {
            ...store.getState().world,
            timeScale
        },
    })

}

export function addWorldPart(part?: WorldPart) {
    let world = store.getState().world
    let lastPart = world.parts[world.parts.length - 1]

    store.setState({
        world: {
            ...world,
            parts: [
                ...world.parts,
                part || getNextWorldPart(lastPart),
            ],
        }
    })
}

export function removeWorldPart(id: string) {
    let { world } = store.getState()

    store.setState({
        world: {
            ...world,
            parts: world.parts.filter(i => i.id !== id),
        }
    })
}

interface CreateBarrelParams {
    position: Tuple3
    size?: Tuple3
    health?: number
    rotation?: number
}

export function createBarrel({
    position: [x = 0, y = 0, z = 0] = [0, 0, 0],
    rotation = 0,
    health = 25,
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
                health,
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

    if (!barrel) {
        return
    }

    updateWorld({
        barrels: [
            ...barrels.filter(i => i.id !== id),
            {
                ...barrel,
                health: Math.max(barrel.health - damage, 0)
            }
        ]
    })
}

export function removeBarrel(id: string) {
    let { world: { barrels } } = store.getState()

    updateWorld({
        barrels: barrels.filter(i => i.id !== id)
    })
} 