import { BOSS_SCORE_INTERVAL } from "@data/const"
import { store } from "."
import { State, WorldPart } from "../types"
import { getNextWorldPart } from "../world/getNextWorldPart"

export function reset(state?: State) {
    let { world, effects, player, boss } = store.getState()

    world.grid.empty()
    store.setState({
        state: state || "intro",
        world: {
            ...world,
            parts: [],
        },
        effects: {
            ...effects,
            explosions: [],
            particles: [],
            lastImpactLocation: [0, 0, -Infinity],
            timeScale: 1,
            time: 0,
        },
        player: {
            ...player,
            level: 1,
            speed: 3,
            health: 100,
            score: 0,
            attempts: player.attempts + 1,
        },
        boss: {
            ...boss,
            nextBossAt: BOSS_SCORE_INTERVAL
        }
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