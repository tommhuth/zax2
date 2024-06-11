import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

export const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => true,
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss, world } = store.getState()

        if (
            Date.now() - boss.lastActiveAt.getTime() > boss.interval
            && boss.state === BossState.UNKNOWN
            && !world.parts.some(i => i.type === WorldPartType.BOSS)
        ) {
            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}