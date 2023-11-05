
import { useFrame, useThree } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { store, useStore } from "../../data/store"
import Turret from "./actors/Turret"
import Plane from "./actors/Plane"
import Default from "./parts/Default"
import Building from "./actors/Building"
import Barrel from "./actors/Barrel"
import ParticleHandler from "./ParticleHandler"
import BulletHandler from "./BulletHandler"
import { WorldPartDefault, WorldPartBuildingsGap, WorldPartType, WorldPartBuildingsLow, WorldPartAirstrip } from "../../data/types"
import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Rocket from "./actors/Rocket"
import { createWorldPart } from "../../data/store/world"
import ExplosionsHandler from "./ExplosionsHandler"
import ShimmerHandler from "./ShimmerHandler"
import Airstrip from "./parts/Airstrip"

export const WORLD_CENTER_X = -1
export const WORLD_LEFT_EDGE = -5
export const WORLD_RIGHT_EDGE = 3
export const WORLD_TOP_EDGE = 5
export const WORLD_BOTTOM_EDGE = 1

export default function World() {
    let parts = useStore(i => i.world.parts)
    let { viewport } = useThree()
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useFrame(() => {
        let { world: { parts }, player: { object: player } } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]
        let lastPartIsAtEdge = forwardWorldPart && player && forwardWorldPart.position.z + forwardWorldPart.size[1] < player.position.z + diagonal

        if (lastPartIsAtEdge || !forwardWorldPart) {
            startTransition(createWorldPart) 
        }
    })

    return (
        <>
            {parts.map(i => {
                switch (i.type) {
                    case WorldPartType.DEFAULT:
                        return <Default key={i.id} {...i as WorldPartDefault} />
                    case WorldPartType.BUILDINGS_GAP:
                        return <BuildingsGap key={i.id} {...i as WorldPartBuildingsGap} />
                    case WorldPartType.BUILDINGS_LOW:
                        return <BuildingsLow key={i.id} {...i as WorldPartBuildingsLow} />
                    case WorldPartType.AIRSTRIP:
                        return <Airstrip key={i.id} {...i as WorldPartAirstrip} />
                    default:
                        throw new Error(`Unknown type: ${i.type}`)
                }
            })}

            <Parts />
            <ParticleHandler />
            <BulletHandler />
            <ExplosionsHandler />
            <ShimmerHandler />
        </>
    )
}


const Parts = memo(() => {
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