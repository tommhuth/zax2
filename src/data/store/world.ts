import { store } from "."
import { WorldPart } from "../types"
import { getNextWorldPart } from "../world/getNextWorldPart"

export function reset() {
    let { world, effects, player } = store.getState()

    world.grid.empty()
    store.setState({
        state: "intro",
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
            speed: 0,
            health: 100,
            score: 0,
            attempts: player.attempts + 1,
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