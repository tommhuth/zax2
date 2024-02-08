import Camera from "./components/Camera"
import { Suspense, startTransition, useEffect, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import Player from "./components/Player"
import World from "./components/world/World"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import { BasicShadowMap, NoToneMapping } from "three"
import { dpr, pixelSize, useStore, zoom } from "./data/store"
import Models from "./components/world/models/Models"
import EdgeOverlay from "./components/EdgeOverlay"
import { Perf } from "r3f-perf"
import MaterialLoader from "./components/world/models/MaterialLoader"
import { Only } from "./data/utils"
import Config from "./data/Config"
import { setLoaded, setReady } from "./data/store/utils" 

export default function Wrapper() {
    let getSize = () => [
        Math.ceil(window.innerWidth / pixelSize) * pixelSize,
        Math.ceil(window.innerHeight / pixelSize) * pixelSize
    ]
    let [size, setSize] = useState(() => getSize())
    let ready = useStore(i => i.ready)

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
                    opacity: ready ? 1 : 0,
                    left: 0,
                    top: 0,
                    position: "fixed",
                }}
                shadows={{
                    type: BasicShadowMap,
                }}
                orthographic
                camera={{
                    zoom,
                    near: 0,
                    far: 150
                }}
                dpr={dpr}
            >
                <Suspense fallback={null}>
                    <EdgeOverlay />
                    <Models />
                    <World />
                    <Player />
                    <Loader />
                </Suspense>

                <Camera />
                <Lights />
                <MaterialLoader />

                <Only if={Config.DEBUG || Config.STATS}>
                    <Perf deepAnalyze style={{ zIndex: 90000 }} />
                </Only>
            </Canvas>
        </>
    )
}

function Loader() {
    let { scene, gl, camera } = useThree()
    let loaded = useStore(i => i.loaded)

    useEffect(() => {
        // not sure this is really needed
        gl.compile(scene, camera)
        startTransition(setLoaded)
    }, [scene, camera])

    useEffect(() => {
        if (loaded) {
            setTimeout(() => {
                document.getElementById("loading")?.remove()
                setReady()
            }, 1000)
        }
    }, [loaded])

    return null
}