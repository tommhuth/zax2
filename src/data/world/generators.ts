import random from "@huth/random"
import { Vector3 } from "three"
import { Tuple2 } from "../../types.global"
import { WorldPart, WorldPartType } from "../types"
import { WORLD_START_Z } from "@data/const"
import { DynamicWorldPartType } from "./getNextWorldPart"

const depthMap: Record<DynamicWorldPartType, number> = {
    [WorldPartType.BUILDINGS_GAP]: 20,
    [WorldPartType.DEFAULT]: 20,
    [WorldPartType.BOSS]: 50,
    [WorldPartType.BUILDINGS_LOW]: 20,
    [WorldPartType.ROCK_VALLEY]: 20,
    [WorldPartType.AIRSTRIP]: 48,
    [WorldPartType.GRASS]: 48,
}

export function makeWorldPartGenerator(type: WorldPartType) {
    return (previous: Pick<WorldPart, "size" | "position">): WorldPart => {
        let startZ = previous.position.z + previous.size[1]

        return {
            id: random.id(),
            position: new Vector3(0, 0, startZ),
            size: [10, depthMap[type]] as Tuple2,
            type
        }
    }
}

export function makeStart(depth: number): WorldPart {
    return {
        id: random.id(),
        position: new Vector3(0, 0, WORLD_START_Z),
        size: [10, depth] as Tuple2,
        type: WorldPartType.START
    }
}

export function makeAsteroidStart(previous: Pick<WorldPart, "size" | "position">): WorldPart {
    let startZ = previous.position.z + previous.size[1]

    return {
        id: random.id(),
        position: new Vector3(0, 0, startZ),
        size: [10, 20] as Tuple2,
        type: WorldPartType.ASTEROID_START
    }
} 