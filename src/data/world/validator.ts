import { store } from "../store"
import { BossState, WorldPart, WorldPartType } from "../types"

export const partValidator: Partial<Record<WorldPartType, (previous: WorldPart) => boolean>> = {
    [WorldPartType.BOSS]: () => {
        let { boss, world, player } = store.getState()

        if (
            player.score > 30_000
            && boss.state === BossState.UNKNOWN
            && !world.parts.some(i => i.type === WorldPartType.BOSS)
        ) {
            return true
        }

        return false
    },
}