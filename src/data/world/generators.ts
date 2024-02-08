import random from "@huth/random"
import { Vector3 } from "three"
import { Tuple2 } from "../../types" 
import { WorldPartDefault, WorldPartBuildingsLow, WorldPartBuildingsGap, WorldPartType, WorldPartAirstrip, WorldPartStart, WorldPartBoss } from "../types"
 
export type BaseWorldPart = { size: Tuple2, position: Vector3 }

function baseProps(previous: BaseWorldPart) {
    let startZ = previous.position.z + previous.size[1]

    return {
        id: random.id(),
        position: new Vector3(0, 0, startZ),
    }
}

export function makeBuildingsGap(previous: BaseWorldPart): WorldPartBuildingsGap {
    let depth = 10
    let width = 10

    return {
        ...baseProps(previous),
        size: [width, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.BUILDINGS_GAP,
    }
}

export function makeDefault(previous: BaseWorldPart): WorldPartDefault {
    let depth = 20

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.DEFAULT,
    }
}

export function makeStart(previous: BaseWorldPart): WorldPartStart {
    let depth = 20

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.START,
    }
} 

export function makeBoss(previous: BaseWorldPart): WorldPartBoss {
    let depth = 85

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.BOSS, 
    }
}

export function makeBuildingsLow(previous: BaseWorldPart): WorldPartBuildingsLow {
    let depth = 20

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.BUILDINGS_LOW,
    }
}

export function makeAirstrip(previous: BaseWorldPart): WorldPartAirstrip {
    let depth = 48

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.AIRSTRIP,
    }
}