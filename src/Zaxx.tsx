import "@components/world/preload"

import Camera from "./components/Camera"
import Player from "./components/Player"
import World from "./components/world/World"
import SharedModels from "./components/world/models/SharedModels"
import Controls from "./components/Controls"
import Canvas from "./Canvas"
import { useStore } from "@data/store"

export default function Zaxx() {
    let attempts = useStore(i => i.player.attempts)

    return (
        <Canvas>

            <Controls key={"Controls" + attempts} />
            <Camera key={"Camera" + attempts} />

            <group dispose={null}>
                <SharedModels />
                <World key={"World" + attempts} />
                <Player key={"Player" + attempts} />
            </group>
        </Canvas>
    )
} 