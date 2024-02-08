import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

let lastBossAt = new Date()
let bossInterval = 0 //20_000

export const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => {
        let { world } = store.getState()

        return true

        return world.parts.every(i => i.type !== WorldPartType.BUILDINGS_LOW)
    },
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss } = store.getState()
        let validBossStates = [BossState.COMPLETE, BossState.UNKNOWN]

        if (new Date().getTime() - lastBossAt.getTime() > bossInterval && validBossStates.includes(boss.state)) {
            lastBossAt = new Date()

            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}