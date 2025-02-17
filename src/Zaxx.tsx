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
    let attempts = useStore(i => i.player.attempts)


    return (
        <>
            <Ui />
            <Canvas>
                {Config.STATS && <Perf deepAnalyze />}

                <Controls key={"controls-" + attempts} />
                <Camera key={"camera-" + attempts} />
                <EdgeOverlay key={"edgeoverlay-" + attempts} ready={ready} />

                <group dispose={null}>
                    <SharedModels />
                    <World key={"world-" + attempts} />
                    <Player key={"player-" + attempts} />
                </group>
            </Canvas>
        </>
    )
}