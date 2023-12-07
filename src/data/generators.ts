import random from "@huth/random"
import { Vector3 } from "three"
import { Tuple2 } from "../types"
import makeCycler from "./cycler"
import { WorldPart, WorldPartDefault, WorldPartBuildingsLow, WorldPartBuildingsGap, WorldPartType, WorldPartAirstrip, WorldPartStart, WorldPartBoss } from "./types"
import { store } from "./store"

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


let counter = 1

export function makeBoss(previous: BaseWorldPart): WorldPartBoss {
    let depth = 80

    return {
        ...baseProps(previous),
        size: [10, depth] as Tuple2,
        color: Math.random() * 0xffffff,
        type: WorldPartType.BOSS,
        counter: counter++,
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

const staticParts = [WorldPartType.START] as const

type DynamicWorldPartType = Exclude<WorldPartType, typeof staticParts[number]>

const types = makeCycler<DynamicWorldPartType>(
    Object.values(WorldPartType).filter((i): i is DynamicWorldPartType => {
        return !staticParts.includes(i as any)
    }),
    .25,
    1
) 

let lastBossAt = new Date()
let bossInterval = 20_000

const validator: Record<WorldPartType, (previous: WorldPart) => boolean> = {
    [WorldPartType.DEFAULT]: () => true,
    [WorldPartType.BUILDINGS_GAP]: () => true,
    [WorldPartType.BUILDINGS_LOW]: () => {
        let { world } = store.getState()

        return world.parts.every(i => i.type !== WorldPartType.BUILDINGS_LOW)
    },
    [WorldPartType.AIRSTRIP]: () => true,
    [WorldPartType.BOSS]: () => {
        let { boss } = store.getState()

        if (new Date().getTime() - lastBossAt.getTime() > bossInterval && !boss) {
            lastBossAt = new Date()

            return true
        }

        return false
    },
    [WorldPartType.START]: () => true,
}

export function getNextWorldPart(previous: WorldPart): WorldPart {
    let type = types.next()

    while (!validator[type](previous)) {
        type = types.next()
    }

    let generators: Record<Exclude<WorldPartType, WorldPartType.START>, (prev: WorldPart) => WorldPart> = {
        [WorldPartType.DEFAULT]: makeDefault,
        [WorldPartType.BUILDINGS_GAP]: makeBuildingsGap,
        [WorldPartType.BUILDINGS_LOW]: makeBuildingsLow,
        [WorldPartType.AIRSTRIP]: makeAirstrip,
        [WorldPartType.BOSS]: makeBoss,
    }

    return generators[type](previous)
}