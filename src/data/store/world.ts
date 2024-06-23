import { store } from "."
import { WorldPart } from "../types"
import { getNextWorldPart } from "../world/getNextWorldPart"


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