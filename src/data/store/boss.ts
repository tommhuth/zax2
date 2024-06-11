import random from "@huth/random"
import { store } from "."
import { Tuple3 } from "../../types"
import { Vector3 } from "three"
import { BossState } from "../types"

export function registerBoss({
    pauseAt,
    position,
}) {
    store.setState({
        boss: {
            ...store.getState().boss,
            pauseAt,
            position,
            health: 100,
            maxHealth: 100,
            state: BossState.IDLE,
            heatSeakers: [],
            time: 0,
        }
    })
}

export function resetBoss() {
    let state = store.getState()

    store.setState({
        boss: {
            ...state.boss,
            pauseAt: Infinity,
            health: 1,
            state: BossState.UNKNOWN,
            lastActiveAt: new Date(),
            heatSeakers: [],
            time: 0,
        }
    })
}

export function defeatBoss() {
    let { boss, world } = store.getState()

    store.setState({
        world: {
            ...world,
            level: world.level + 1,
        },
        boss: {
            ...boss,
            state: BossState.DEAD,
        }
    })
}

export function removeHeatSeaker(id: string) {
    let { boss } = store.getState()

    store.setState({
        boss: {
            ...boss,
            heatSeakers: boss.heatSeakers.filter(i => i.id !== id)
        }
    })
}

export function createHeatSeaker([x, y, z]: Tuple3) {
    let { world, boss, instances } = store.getState()
    let id = random.id()
    let position = new Vector3(x, y, z)
    let size = .35
    let client = world.grid.createClient(position.toArray(), [size, size, size], {
        type: "heatseaker",
        id,
    })

    store.setState({
        boss: {
            ...boss,
            heatSeakers: [
                ...boss.heatSeakers,
                {
                    id,
                    client,
                    velocity: new Vector3(),
                    size: .2,
                    position,
                    index: instances.sphere.index.next(),
                }
            ]
        }
    })

    return id
}


export function setBossProp(key: string, value: any) {
    let { boss } = store.getState()

    store.setState({
        boss: {
            ...boss,
            [key]: value
        }
    })
}

export function damageBoss(amount: number) {
    let boss = store.getState().boss

    store.setState({
        boss: {
            ...boss,
            health: Math.max(boss.health - amount, 0)
        }
    })
}