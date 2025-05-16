import random from "@huth/random"
import { store } from "."
import { Tuple3 } from "../../types.global"
import { Vector3 } from "three"
import { BossState } from "../types"
import { BOSS_SCORE_INTERVAL } from "@data/const"

export function registerBoss(pauseAt: number) {
    let { boss, player } = store.getState()

    store.setState({
        boss: {
            ...boss,
            pauseAt,
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
            health: Infinity,
            state: BossState.UNKNOWN,
            lastActiveAt: new Date(),
            heatSeakers: [],
            time: 0,
        }
    })
}

export function defeatBoss() {
    let { boss, player } = store.getState()

    if (player.health === 0) {
        return
    }

    store.setState({
        player: {
            ...player,
            level: player.level + 1,
        },
        boss: {
            ...boss,
            state: BossState.DEAD,
            nextBossAt: player.score + BOSS_SCORE_INTERVAL
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
        type: "heatSeaker",
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
    let health = Math.max(boss.health - amount, 0)

    store.setState({
        boss: {
            ...boss,
            health,
        }
    })

    return health === 0
}