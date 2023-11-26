import Camera from "./components/Camera"
import { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Player from "./components/Player"
import World from "./components/world/World"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import { BasicShadowMap, NoToneMapping } from "three"
import { dpr, isSmallScreen, pixelSize, useStore } from "./data/store"
import Models from "./components/world/models/Models"
import EdgeOverlay from "./components/EdgeOverlay"
import { Text3D } from "@react-three/drei"

export default function Wrapper() {
    let getSize = () => [
        Math.ceil(window.innerWidth / pixelSize) * pixelSize,
        Math.ceil(window.innerHeight / pixelSize) * pixelSize
    ]
    let [size, setSize] = useState(() => getSize())
    let loaded = useStore(i => i.loaded)

    useEffect(() => {
        let tid: ReturnType<typeof setTimeout>
        let update = () => {
            clearTimeout(tid)
            tid = setTimeout(() => setSize(getSize()), 50)
        }

        screen.orientation.addEventListener("change", update)
        window.addEventListener("resize", update)

        return () => {
            screen.orientation.removeEventListener("change", update)
            window.removeEventListener("resize", update)
        }
    }, [])

    return (
        <>
            <Ui />
            <Suspense fallback={null}>
                <Canvas
                    gl={{
                        antialias: false,
                        depth: true,
                        stencil: false,
                        alpha: false,
                        powerPreference: "high-performance",
                        toneMapping: NoToneMapping
                    }}
                    style={{
                        height: size[1],
                        width: size[0],
                        opacity: loaded ? 1 : 0,
                        left: 0,
                        top: 0,
                        position: "fixed",
                    }}
                    shadows={{
                        type: BasicShadowMap,
                    }}
                    orthographic
                    camera={{
                        zoom: isSmallScreen ? 40 : 70,
                        near: 0,
                        far: 150
                    }}
                    dpr={dpr}
                >
                    <Text3D
                        font="/fonts/roboto.json"
                        position-z={-10_000}
                    >
                        L
                    </Text3D>
                    <EdgeOverlay />
                    <Camera />
                    <Lights />

                    <Models />
                    <World />
                    <Player />
                </Canvas>
            </Suspense>
        </>
    )
}