import { useFrame, useThree } from "@react-three/fiber"
import { memo, startTransition, useEffect } from "react"
import { store, useStore } from "../../data/store"
import Turret from "./actors/Turret"
import Plane from "./actors/Plane"
import Default from "./parts/Default"
import Building from "./actors/Building"
import Barrel from "./actors/Barrel"
import ParticleHandler from "./ParticleHandler"
import BulletHandler from "./BulletHandler"
import { WorldPartDefault, WorldPartBuildingsGap, WorldPartType, WorldPartBuildingsLow, WorldPartAirstrip, WorldPartStart, WorldPartBoss } from "../../data/types"
import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Rocket from "./actors/Rocket"
import { addWorldPart } from "../../data/store/world"
import ExplosionsHandler from "./ExplosionsHandler"
import ShimmerHandler from "./ShimmerHandler"
import Airstrip from "./parts/Airstrip"
import Start from "./parts/Start"
import BossPart from "./parts/Boss"
import { makeStart } from "../../data/world/generators"
import { Vector3 } from "three"
import SmokeHandler from "./SmokeHandler"

export const WORLD_CENTER_X = 0
export const WORLD_LEFT_EDGE = 5
export const WORLD_RIGHT_EDGE = -4
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1

export default function World() {
    let parts = useStore(i => i.world.parts)
    let loaded = useStore(i => i.loaded)
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame(() => {
        let { world: { parts }, loaded, boss, player: { object: player } } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]

        if (forwardWorldPart) {
            let lastPartIsAtEdge = forwardWorldPart && player && forwardWorldPart.position.z + forwardWorldPart.size[1] < player.position.z + diagonal

            if ((lastPartIsAtEdge || !forwardWorldPart) && !boss && loaded) {
                startTransition(addWorldPart)
            }
        }
    })

    useEffect(() => {
        if (loaded) {
            setTimeout(() => addWorldPart(makeStart({ position: new Vector3(0, 0, 90), size: [0, 0] })), 100)
        }
    }, [loaded])

    return (
        <>
            {parts.map(i => {
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
            })}

            <Actors />
            <ParticleHandler />
            <BulletHandler />
            <ExplosionsHandler />
            <ShimmerHandler />
            <SmokeHandler />
        </>
    )
}


const Actors = memo(() => {
    let buildings = useStore(i => i.world.buildings)
    let turrets = useStore(i => i.world.turrets)
    let planes = useStore(i => i.world.planes)
    let barrels = useStore(i => i.world.barrels)
    let rockets = useStore(i => i.world.rockets)

    return (
        <>
            {buildings.map(i => {
                return <Building key={i.id} {...i} />
            })}
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