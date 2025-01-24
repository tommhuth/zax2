import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect, useLayoutEffect, useRef } from "react"
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
import { makeAsteroidStart, makeStart } from "@data/world/generators"
import AsteroidStart from "./parts/AsteroidStart"
import { setState } from "@data/store/utils"


const startType = window.localStorage.getItem("initPartType") as DynamicWorldPartType | null

window.localStorage.removeItem("initPartType")

export default function World() {
    let diagonal = useStore(i => i.world.diagonal)
    let loaded = useStore(i => i.loaded)
    let state = useStore(i => i.state)
    let hasinit = useRef(false)

    useFrame((state, delta) => {
        setTime(store.getState().effects.time + ndelta(delta))
    })

    useEffect(() => {
        let onClick = () => {
            let { state, world } = useStore.getState()
            let previousPart = world.parts.at(-1)

            if (state === "intro" && previousPart) {
                setState("running")
                addWorldPart(makeAsteroidStart(previousPart))
            } else if (state === "gameover") {
                // reset
            }
        }

        window.addEventListener("click", onClick)

        return () => {
            window.removeEventListener("click", onClick)
        }
    }, [])

    useLayoutEffect(() => {
        if (!loaded || !diagonal) {
            return
        }

        if (startType) {
            startTransition(() => {
                addWorldPart(partGenerator[startType]({
                    position: new Vector3(0, 0, WORLD_START_Z),
                    size: [0, 0],
                }))
            })
        } else if (state === "intro" && !hasinit.current) {
            addWorldPart(makeStart(diagonal))
            hasinit.current = true
        }
    }, [loaded, diagonal, state])

    useFrame(() => {
        let {
            world: { parts },
            player: { object: player },
            ready,
            debug,
            state
        } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]

        if (forwardWorldPart && player && state === "running") {
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
            case WorldPartType.START:
                return <Start key={i.id} {...i} />
            case WorldPartType.ASTEROID_START:
                return <AsteroidStart key={i.id} {...i} />
            case WorldPartType.ROCK_VALLEY:
                return <RockValley key={i.id} {...i} />
            case WorldPartType.DEFAULT:
                return <Default key={i.id} {...i} />
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