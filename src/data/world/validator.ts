import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

let lastBossAt = new Date()
let bossInterval = 60_000

export const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => {
        let { world } = store.getState() 

        return world.parts.filter(i => i.type === WorldPartType.BUILDINGS_LOW).length < 2
    },
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss } = store.getState()  

        if (Date.now() - lastBossAt.getTime() > bossInterval && boss.state === BossState.UNKNOWN) {
            lastBossAt = new Date()

            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}