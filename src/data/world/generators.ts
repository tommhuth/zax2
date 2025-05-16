import random from "@huth/random"
import { Vector3 } from "three"
import { Tuple2 } from "../../types.global"
import { WorldPart, WorldPartType } from "../types"

const depthMap: Record<WorldPartType, number> = {
    [WorldPartType.BUILDINGS_GAP]: 20,
    [WorldPartType.DEFAULT]: 20,
    [WorldPartType.BOSS]: 50.6,
    [WorldPartType.BUILDINGS_LOW]: 20,
    [WorldPartType.ROCK_VALLEY]: 20,
    [WorldPartType.AIRSTRIP]: 48,
    [WorldPartType.GRASS]: 48,
    [WorldPartType.START]: 56.8,
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