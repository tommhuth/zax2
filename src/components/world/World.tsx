import { useFrame } from "@react-three/fiber"
import { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react"
import { store, useStore } from "../../data/store"
import ParticleHandler from "./effects/ParticleHandler"
import BulletHandler from "../BulletHandler"
import { addWorldPart, reset } from "../../data/store/world"
import ExplosionsHandler from "./effects/ExplosionsHandler"
import { Vector3 } from "three"
import SmokeHandler from "./effects/SmokeHandler"
import { WORLD_PLAYER_START_Z, WORLD_START_Z } from "../../data/const"
import { setTime } from "@data/store/effects"
import { ndelta } from "@data/utils"
import { DynamicWorldPartType, partGenerator } from "@data/world/getNextWorldPart"
import { WorldPartType } from "@data/types"
import Actors from "./Actors"
import WorldParts from "./WorldParts"

const startType = window.localStorage.getItem("initPartType") as DynamicWorldPartType | null

window.localStorage.removeItem("initPartType")

export default function World() {
    let diagonal = useStore(i => i.world.diagonal)
    let loaded = useStore(i => i.loaded)
    let state = useStore(i => i.state)
    let attempts = useStore(i => i.player.attempts)
    let hasInitialized = useRef(false)
    let [restartEnabled, setRestartEnabled] = useState(false)

    useLayoutEffect(() => {
        hasInitialized.current = false
    }, [attempts])

    useLayoutEffect(() => {
        if (state === "gameover") {
            let tid = setTimeout(() => setRestartEnabled(true), 8_000)

            setRestartEnabled(false)

            return () => {
                clearTimeout(tid)
            }
        }
    }, [state])

    useEffect(() => {
        let onClick = () => {
            let { state } = useStore.getState()

            if ((state === "gameover" && restartEnabled) || state === "intro") {
                startTransition(() => reset("running"))
            }
        }

        window.addEventListener("click", onClick)

        return () => {
            window.removeEventListener("click", onClick)
        }
    }, [restartEnabled])

    useLayoutEffect(() => {
        if (!loaded || !diagonal || state === "gameover") {
            return
        }

        let startZ = {
            intro: WORLD_PLAYER_START_Z - diagonal * .5,
            running: WORLD_START_Z,
        }[state]
        let part = partGenerator[startType || WorldPartType.DEFAULT]({
            position: new Vector3(0, 0, startZ),
            size: [0, 0],
        })

        startTransition(() => addWorldPart(part))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, state])

    useFrame((state, delta) => {
        let { effects } = store.getState()

        setTime(effects.time + ndelta(delta))
    })

    useFrame(() => {
        let {
            world: { parts },
            player: { object: player },
            ready,
            debug,
        } = store.getState()
        let forwardWorldPart = parts[parts.length - 1]

        if (forwardWorldPart && player) {
            let { size, position } = forwardWorldPart
            let buffer = diagonal * 1.5
            let lastPartIsAtEdge = position.z + size[1] < player.position.z + buffer

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