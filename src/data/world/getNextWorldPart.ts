import { store } from "@data/store"
import { WorldPart, WorldPartType } from "../types"
import { partValidator } from "./validator"
import { removeOldestForcedWorldPart } from "@data/store/debug"
import { makeWorldPartGenerator } from "./generators"
import Cycler from "@data/lib/Cycler"

const specialParts = [WorldPartType.START] as const

export type DynamicWorldPartType = Exclude<WorldPartType, typeof specialParts[number]>

export const worlPartTypes = new Cycler<DynamicWorldPartType>(
    Object.values(WorldPartType).filter((i): i is DynamicWorldPartType => {
        return !specialParts.includes(i as any)
    }),
    .15,
    1
)

export let partGenerator: Record<WorldPartType, (previous: Pick<WorldPart, "size" | "position">) => WorldPart> = {
    [WorldPartType.DEFAULT]: makeWorldPartGenerator(WorldPartType.DEFAULT),
    [WorldPartType.BUILDINGS_GAP]: makeWorldPartGenerator(WorldPartType.BUILDINGS_GAP),
    [WorldPartType.BUILDINGS_LOW]: makeWorldPartGenerator(WorldPartType.BUILDINGS_LOW),
    [WorldPartType.AIRSTRIP]: makeWorldPartGenerator(WorldPartType.AIRSTRIP),
    [WorldPartType.ROCK_VALLEY]: makeWorldPartGenerator(WorldPartType.ROCK_VALLEY),
    [WorldPartType.GRASS]: makeWorldPartGenerator(WorldPartType.GRASS),
    [WorldPartType.START]: makeWorldPartGenerator(WorldPartType.START),
    [WorldPartType.BOSS]: makeWorldPartGenerator(WorldPartType.BOSS),
}

export function getNextWorldPart(previous: WorldPart): WorldPart {
    let { debug } = store.getState()
    let forcedType = debug.forcedWorldParts[0]
    let type = forcedType || worlPartTypes.next()
    let validator = partValidator[type]

    while (validator ? !validator(previous) : false) {
        type = worlPartTypes.next()
        validator = partValidator[type]
    }

    if (forcedType && forcedType === type) {
        removeOldestForcedWorldPart()
    }

    return partGenerator[type](previous)
}