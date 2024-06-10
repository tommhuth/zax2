import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

export let lastBossAt = new Date()
export let bossInterval = 120_000

export const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => true,
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss } = store.getState()  

        if (
            Date.now() - lastBossAt.getTime() > bossInterval 
            && boss.state === BossState.UNKNOWN
        ) {
            lastBossAt = new Date()

            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}