import { store } from "@data/store"
import Cycler from "../Cycler"
import { WorldPart, WorldPartType } from "../types"
import * as generators from "./generators"
import { validator } from "./validator"
import { removeOldestForcedWorldPart } from "@data/store/debug"

const specialParts = [WorldPartType.START] as const

type DynamicWorldPartType = Exclude<WorldPartType, typeof specialParts[number]>

export const worlPartTypes = new Cycler<DynamicWorldPartType>(
    Object.values(WorldPartType).filter((i): i is DynamicWorldPartType => {
        return !specialParts.includes(i as any)
    }),
    .15,
    1
) 

let partGenerator: Record<DynamicWorldPartType, (prev: WorldPart) => WorldPart> = {
    [WorldPartType.DEFAULT]: generators.makeDefault,
    [WorldPartType.BUILDINGS_GAP]: generators.makeBuildingsGap,
    [WorldPartType.BUILDINGS_LOW]: generators.makeBuildingsLow,
    [WorldPartType.AIRSTRIP]: generators.makeAirstrip,
    [WorldPartType.BOSS]: generators.makeBoss,
}

export function getNextWorldPart(previous: WorldPart): WorldPart {
    let forced = store.getState().debug.forcedWorldParts[0]
    let type = forced || worlPartTypes.next()

    while (!validator[type](previous)) {
        type = worlPartTypes.next()
    } 

    if (forced && forced === type) {
        removeOldestForcedWorldPart()
    }

    return partGenerator[type](previous)
}