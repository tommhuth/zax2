import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect } from "react"
import { store, useStore } from "../../data/store"
import Turret from "./actors/Turret"
import Plane from "./actors/Plane"
import Default from "./parts/Default"
import Barrel from "./actors/Barrel"
import ParticleHandler from "./effects/ParticleHandler"
import BulletHandler from "../BulletHandler"
import { WorldPartDefault, WorldPartBuildingsGap, WorldPartType, WorldPartBuildingsLow, WorldPartAirstrip, WorldPartStart, WorldPartBoss, WorldPart } from "../../data/types"
import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Rocket from "./actors/Rocket"
import { addWorldPart } from "../../data/store/world"
import ExplosionsHandler from "./effects/ExplosionsHandler"
import Airstrip from "./parts/Airstrip"
import Start from "./parts/Start"
import BossPart from "./parts/Boss"
import { makeAirstrip, makeBoss, makeBuildingsGap, makeBuildingsLow, makeDefault, makeStart } from "../../data/world/generators"
import { Vector3 } from "three"
import SmokeHandler from "./effects/SmokeHandler"
import { WORLD_START_Z } from "../../data/const"

export default function World() {
    let diagonal = useStore(i => i.world.diagonal)
    let loaded = useStore(i => i.loaded)

    useFrame(() => {
        let {
            world: { parts },
            player: { object: player },
            ready,
            debug
        } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]

        if (forwardWorldPart) {
            let lastPartIsAtEdge = player
                && forwardWorldPart.position.z + forwardWorldPart.size[1] < player.position.z + diagonal * 1

            if (
                (lastPartIsAtEdge || !forwardWorldPart)
                && ready
                && !debug.pauseWorldGeneration
            ) {
                startTransition(addWorldPart)
            }
        }
    })

    useEffect(() => {
        const startType = window.localStorage.getItem("initPartType") || WorldPartType.START
        const type: Record<WorldPartType, (previous: WorldPart) => WorldPart> = {
            [WorldPartType.AIRSTRIP]: makeAirstrip,
            [WorldPartType.BOSS]: makeBoss,
            [WorldPartType.BUILDINGS_GAP]: makeBuildingsGap,
            [WorldPartType.BUILDINGS_LOW]: makeBuildingsLow,
            [WorldPartType.DEFAULT]: makeDefault,
            [WorldPartType.START]: makeStart,
        }

        if (loaded) {
            startTransition(() => {
                addWorldPart(type[startType]({
                    position: new Vector3(0, 0, WORLD_START_Z + 5),
                    size: [0, 0]
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
            case WorldPartType.DEFAULT:
                return <Default key={i.id} {...i as WorldPartDefault} />
            case WorldPartType.START:
                return <Start key={i.id} {...i as WorldPartStart} />
            case WorldPartType.BUILDINGS_GAP:
                return <BuildingsGap key={i.id} {...i as WorldPartBuildingsGap} />
            case WorldPartType.BUILDINGS_LOW:
                return <BuildingsLow key={i.id} {...i as WorldPartBuildingsLow} />
            case WorldPartType.AIRSTRIP:
                return <Airstrip key={i.id} {...i as WorldPartAirstrip} />
            case WorldPartType.BOSS:
                return <BossPart key={i.id} {...i as WorldPartBoss} />
            default:
                throw new Error(`Unknown type: ${i.type}`)
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