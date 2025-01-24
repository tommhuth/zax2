import "@components/world/preload"

import Camera from "./components/Camera"
import Player from "./components/Player"
import World from "./components/world/World"
import Ui from "./components/ui/Ui"
import SharedModels from "./components/world/models/SharedModels"
import EdgeOverlay from "./components/EdgeOverlay"
import Controls from "./components/Controls"
import Canvas from "./Canvas"
import { useStore } from "@data/store"
import { Perf } from "r3f-perf"
import Config from "@data/Config"

export default function Zaxx() {
    let ready = useStore(i => i.ready)

    return (
        <>
            <Ui />
            <Canvas>
                {Config.STATS && <Perf deepAnalyze />}

                <Controls />
                <Camera />
                <EdgeOverlay ready={ready} />

                <group dispose={null}>
                    <SharedModels />
                    <World />
                    <Player />
                </group>
            </Canvas>
        </>
    )
}