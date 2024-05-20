import Cycler from "../Cyclerx"
import { WorldPart, WorldPartType } from "../types"
import * as generators from "./generators"
import { validator } from "./validator"

const specialParts = [WorldPartType.START] as const

type DynamicWorldPartType = Exclude<WorldPartType, typeof specialParts[number]>

const types = new Cycler<DynamicWorldPartType>(
    Object.values(WorldPartType).filter((i): i is DynamicWorldPartType => {
        return !specialParts.includes(i as any)
    }),
    .25,
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
    let type = types.next()

    while (!validator[type](previous)) {
        type = types.next()
    } 

    return partGenerator[type](previous)
}