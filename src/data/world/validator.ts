import { store } from "../store"
import { WorldPart, WorldPartType } from "../types"

let lastBossAt = new Date()
let bossInterval = 20_000

export const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => {
        let { world } = store.getState()

        return world.parts.every(i => i.type !== WorldPartType.BUILDINGS_LOW)
    },
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss } = store.getState()

        if (new Date().getTime() - lastBossAt.getTime() > bossInterval && !boss) {
            lastBossAt = new Date()

            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}