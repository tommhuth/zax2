import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

export const partValidator: Partial<Record<WorldPartType, (previous: WorldPart) => boolean>> = {  
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
}