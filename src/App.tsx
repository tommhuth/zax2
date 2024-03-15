import Camera from "./components/Camera"
import {
    Suspense,
    startTransition,
    useEffect,
    useState,
} from "react"
import { Canvas, useThree } from "@react-three/fiber"
import Player from "./components/Player"
import World from "./components/world/World"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import {
    NoToneMapping,
    VSMShadowMap,
} from "three"
import { useStore } from "./data/store"
import Models from "./components/world/models/Models"
import EdgeOverlay from "./components/EdgeOverlay"
import { Perf } from "r3f-perf"
import MaterialLoader from "./components/world/materials/MaterialLoader"
import { Only } from "./data/utils"
import Config from "./data/Config"
import { setLoaded, setReady, setSetup } from "./data/store/utils"
import Controls from "./components/Controls"
import { DPR, PIXEL_SIZE, ZOOM } from "./data/const"

// round up to full pixel
let getSize = () => [
    Math.ceil(window.innerWidth / PIXEL_SIZE) * PIXEL_SIZE,
    Math.ceil(window.innerHeight / PIXEL_SIZE) * PIXEL_SIZE,
]

export default function Wrapper() {
    let [size, setSize] = useState(() => getSize())
    let ready = useStore((i) => i.ready)

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
                    toneMapping: NoToneMapping,
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
                    type: VSMShadowMap,
                }}
                orthographic
                camera={{
                    zoom: ZOOM,
                    near: 0,
                    far: 150,
                }}
                dpr={DPR}
            >
                <Suspense fallback={null}>
                    <EdgeOverlay />
                    <Models />
                    <World />
                    <Player />
                    <Loader />
                </Suspense>

                <Controls />
                <Camera />
                <Lights />
                <MaterialLoader />

                <Only if={Config.STATS}>
                    <Perf
                        deepAnalyze
                        style={{ zIndex: 90000 }}
                    />
                </Only>
            </Canvas>
        </>
    )
}

function Loader() {
    let { scene, gl, camera } = useThree()
    let loaded = useStore((i) => i.loaded)

    useEffect(() => {
        // not sure this is really needed
        gl.compile(scene, camera)

        requestIdleCallback(() => {
            startTransition(setLoaded)
        })
    }, [scene, camera])

    useEffect(() => {
        if (loaded) {
            setTimeout(() => {
                requestIdleCallback(() => {
                    document.getElementById("loading")?.remove()
                    startTransition(setSetup)
                    setTimeout(() => startTransition(setReady), 1000)
                })
            }, 1000)
        }
    }, [loaded])

    return null
}