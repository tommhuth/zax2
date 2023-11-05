import { OBB } from "three/examples/jsm/math/OBB"
import { Tuple3 } from "../../types"
import { store } from "../store"
import { Barrel } from "../types"
import { Box3, Matrix3, Vector3 } from "three"
import random from "@huth/random"
import { getNextWorldPart } from "../generators"
import { updateWorld } from "./utils"

export function createWorldPart() {
    let world = store.getState().world
    let lastPart = world.parts[world.parts.length - 1]

    store.setState({
        world: {
            ...world,
            parts: [
                ...world.parts,
                getNextWorldPart(lastPart),
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
    let obb = new OBB(new Vector3(x, y, z), new Vector3(...size.map(i => i / 2)), new Matrix3().rotate(rotation))
    let aabb = new Box3().setFromCenterAndSize(new Vector3(z, y, z), new Vector3(...size))
    let { instances, world: { grid, barrels } } = store.getState()
    let client = grid.newClient(
        position.toArray(),
        [...size],
        { type: "barrel", id, size, position }
    )

    updateWorld({
        barrels: [
            {
                position,
                id,
                client,
                obb,
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
    let { world: { barrels, grid } } = store.getState()
    let barrel = barrels.find(i => i.id === id) as Barrel

    updateWorld({
        barrels: barrels.filter(i => i.id !== id)
    })

    barrel && grid.remove(barrel.client)
}

export function createBuilding(
    size: Tuple3 = [1, 1, 1],
    [x = 0, y = 0, z = 0] = [],
) {
    let id = random.id()
    let position = new Vector3(x, y + size[1] / 2, z)
    let box = new Box3().setFromCenterAndSize(new Vector3(x, y + size[1] / 2, z), new Vector3(...size))
    let { grid, buildings } = store.getState().world
    let client = grid.newClient(
        [position.x, position.y + size[1] / 2, position.z],
        [...size],
        { type: "building", id, size, position }
    )

    updateWorld({
        buildings: [
            {
                position,
                id,
                size: size as Tuple3,
                aabb: box,
                client,
                color: Math.random() * 0xffffff,
            },
            ...buildings,
        ]
    })

    return id
}

export function removeBuilding(id: string) {
    let { world: { grid, buildings } } = store.getState()
    let building = buildings.find(i => i.id === id)

    if (building) {
        updateWorld({
            buildings: buildings.filter(i => i.id !== id)
        })
        grid.remove(building.client)
    }
}