import random from "@huth/random"
import { Vector3 } from "three" 
import { Tuple2 } from "../types"
import makeCycler from "./cycler" 
import { WorldPart, WorldPartDefault, WorldPartBuildingsLow, WorldPartBuildingsGap, WorldPartType, WorldPartAirstrip } from "./types"

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

const types = makeCycler(Object.values(WorldPartType), .1) // Object.values(WorldPartType) Object.values(WorldPartType)

types.next()

export function getNextWorldPart(previous: WorldPart): WorldPart {
    let type = types.next()
    let generators: Record<WorldPartType, (prev: WorldPart) => WorldPart> = {
        [WorldPartType.DEFAULT]: makeDefault,
        [WorldPartType.BUILDINGS_GAP]: makeBuildingsGap,
        [WorldPartType.BUILDINGS_LOW]: makeBuildingsLow,
        [WorldPartType.AIRSTRIP]: makeAirstrip
    }

    return generators[type](previous)
}
 