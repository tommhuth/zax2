import { WorldPartType } from "@data/types"
import { store } from "."

export function setShowColliders(value: boolean) {
    let { debug } = store.getState()

    store.setState({
        debug: {
            ...debug,
            showColliders: value
        }
    })
}

export function setPauseWorldGeneration(value: boolean) {
    let { debug } = store.getState()

    store.setState({
        debug: {
            ...debug,
            pauseWorldGeneration: value
        }
    })
}

export function addForcedWorldPart(part: WorldPartType) {
    let { debug } = store.getState()

    store.setState({
        debug: {
            ...debug,
            forcedWorldParts: [...debug.forcedWorldParts, part]
        }
    })
}

export function removeOldestForcedWorldPart() {
    let { debug } = store.getState()

    store.setState({
        debug: {
            ...debug,
            forcedWorldParts: debug.forcedWorldParts.slice(1)
        }
    })
}
