import Camera from "./components/Camera"
import { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber" 
import Player from "./components/Player"
import World from "./components/world/World"
import { Only } from "./data/utils"
import Config from "./data/Config"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import { BasicShadowMap, NoToneMapping } from "three"
import { dpr, isSmallScreen, pixelSize, useStore } from "./data/store"
import Models from "./components/world/models/Models"
import EdgeOverlay from "./components/EdgeOverlay"

export default function Wrapper() {
    let getSize = () => [
        Math.ceil(window.innerWidth / pixelSize) * pixelSize,
        Math.ceil(window.innerHeight / pixelSize) * pixelSize
    ]
    let [size, setSize] = useState(() => getSize())
    let loaded = useStore(i => i.loaded)

    useEffect(() => {
        let tid: ReturnType<typeof setTimeout>
        let onResize = () => {
            clearTimeout(tid)
            tid = setTimeout(() => setSize(getSize()), 50)
        }

        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, []) 

    return (
        <div
            style={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                position: "fixed",
            }}
        >
            <Ui />
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
                <Only if={Config.DEBUG}> 
                </Only>

                <EdgeOverlay />
                <Camera />
                <Lights />

                <Suspense fallback={null}> 
                    <Models />
                    <World />
                    <Player />
                </Suspense>
            </Canvas>
        </div>
    )
}