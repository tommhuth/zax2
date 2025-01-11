import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect } from "react"
import { store, useStore } from "../../data/store"
import Turret from "./actors/Turret"
import Plane from "./actors/Plane"
import Default from "./parts/Default"
import Barrel from "./actors/Barrel"
import ParticleHandler from "./effects/ParticleHandler"
import BulletHandler from "../BulletHandler"
import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Rocket from "./actors/Rocket"
import { addWorldPart } from "../../data/store/world"
import ExplosionsHandler from "./effects/ExplosionsHandler"
import Airstrip from "./parts/Airstrip"
import Start from "./parts/Start"
import BossPart from "./parts/Boss"
import { Vector3 } from "three"
import SmokeHandler from "./effects/SmokeHandler"
import { WORLD_START_Z } from "../../data/const"
import { setTime } from "@data/store/effects"
import { ndelta } from "@data/utils"
import RockValley from "./parts/RockValley"
import { DynamicWorldPartType, partGenerator } from "@data/world/getNextWorldPart"
import { WorldPartType } from "@data/types"
import GrassPart from "./parts/Grass"

export default function World() {
    let diagonal = useStore(i => i.world.diagonal)
    let loaded = useStore(i => i.loaded)

    useFrame((state, delta) => {
        setTime(store.getState().effects.time + ndelta(delta))
    })

    useFrame(() => {
        let {
            world: { parts },
            player: { object: player },
            ready,
            debug
        } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]

        if (forwardWorldPart && player) {
            let lastPartIsAtEdge = forwardWorldPart.position.z + forwardWorldPart.size[1] < player.position.z + diagonal

            if (
                lastPartIsAtEdge
                && ready
                && !debug.pauseWorldGeneration
            ) {
                startTransition(addWorldPart)
            }
        }
    })

    useEffect(() => {
        const startType = window.localStorage.getItem("initPartType") as DynamicWorldPartType

        window.localStorage.removeItem("initPartType")

        if (loaded) {
            startTransition(() => {
                addWorldPart(partGenerator[startType || WorldPartType.START]({
                    position: new Vector3(0, 0, WORLD_START_Z),
                    size: [0, 0],
                }))
            })
        }
    }, [loaded])

    return (
        <>
            <WorldParts />
            <Actors />
            <ParticleHandler />
            <BulletHandler />
            <ExplosionsHandler />
            <SmokeHandler />
        </>
    )
}

function WorldParts() {
    let parts = useStore(i => i.world.parts)

    return parts.map(i => {
        switch (i.type) {
            case WorldPartType.ROCK_VALLEY:
                return <RockValley key={i.id} {...i} />
            case WorldPartType.DEFAULT:
                return <Default key={i.id} {...i} />
            case WorldPartType.START:
                return <Start key={i.id} {...i} />
            case WorldPartType.BUILDINGS_GAP:
                return <BuildingsGap key={i.id} {...i} />
            case WorldPartType.BUILDINGS_LOW:
                return <BuildingsLow key={i.id} {...i} />
            case WorldPartType.AIRSTRIP:
                return <Airstrip key={i.id} {...i} />
            case WorldPartType.GRASS:
                return <GrassPart key={i.id} {...i} />
            case WorldPartType.BOSS:
                return <BossPart key={i.id} {...i} />
            default:
                throw new Error(`Unregistered part type: ${i.type}`)
        }
    })
}

const Actors = memo(() => {
    let turrets = useStore(i => i.world.turrets)
    let planes = useStore(i => i.world.planes)
    let barrels = useStore(i => i.world.barrels)
    let rockets = useStore(i => i.world.rockets)

    return (
        <>
            {turrets.map(i => {
                return <Turret key={i.id} {...i} />
            })}
            {planes.map(i => {
                return <Plane key={i.id} {...i} />
            })}
            {barrels.map(i => {
                return <Barrel key={i.id} {...i} />
            })}
            {rockets.map(i => {
                return <Rocket key={i.id} {...i} />
            })}
        </>
    )
})