import "@components/world/preload"

import Camera from "./components/Camera"
import Player from "./components/Player"
import World from "./components/world/World"
import SharedModels from "./components/world/models/SharedModels"
import EdgeOverlay from "./components/EdgeOverlay"
import Controls from "./components/Controls"
import Canvas from "./Canvas"
import { useStore } from "@data/store"
import { Perf } from "r3f-perf"
import Config from "@data/Config"

export default function Zaxx() {
    let ready = useStore(i => i.ready)
    let attempts = useStore(i => i.player.attempts)

    return (
        <Canvas>
            {Config.STATS && <Perf deepAnalyze />}

            <Controls key={"Controls" + attempts} />
            <Camera key={"Camera" + attempts} />
            <EdgeOverlay key={"EdgeOverlay" + attempts} ready={ready} />

            <group dispose={null}>
                <SharedModels />
                <World key={"World" + attempts} />
                <Player key={"Player" + attempts} />
            </group>
        </Canvas>
    )
} 