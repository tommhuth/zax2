import Lights from "@components/Lights"
import MaterialLoader from "@components/world/materials/MaterialLoader"
import Config from "@data/Config"
import { Perf } from "r3f-perf"
import { CanvasProps, Canvas as FiberCanvas } from "@react-three/fiber"
import { startTransition, Suspense, useEffect, useState } from "react"
import { BasicShadowMap, NoToneMapping } from "three"
import { useStore } from "@data/store"
import ShaderLoader from "./components/ShaderLoader"
import { getZoom } from "@components/Camera"

// round up to full pixel
export let getSize = () => [
    Math.ceil(window.innerWidth / getPixelSize()) * getPixelSize(),
    Math.ceil(window.innerHeight / getPixelSize()) * getPixelSize(),
]

function getPixelSize() {
    return Math.min(window.innerWidth, window.innerHeight) < 800 ? 3 : 4
}

export function getDpr() {
    const pixelSize = getPixelSize()

    return 1 / pixelSize
}

export default function Canvas({ children, ...rest }: CanvasProps) {
    let [size, setSize] = useState(() => getSize())
    let ready = useStore((i) => i.ready)

    useEffect(() => {
        let update = () => {
            startTransition(() => {
                setSize(getSize())
            })
        }

        screen.orientation.addEventListener("change", update)
        window.addEventListener("resize", update)

        return () => {
            screen.orientation.removeEventListener("change", update)
            window.removeEventListener("resize", update)
        }
    }, [])

    return (
        <FiberCanvas
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
                left: 0,
                top: 0,
                position: "fixed",
                opacity: ready ? 1 : 0,
            }}
            shadows={{
                type: BasicShadowMap,
            }}
            orthographic
            camera={{
                zoom: getZoom(),
                near: 1,
                far: 150,
            }}
            dpr={getDpr()} // todo: inline reactive
            {...rest}
        >
            <Lights />
            <MaterialLoader />
            <ShaderLoader />

            <Suspense>
                {children}
            </Suspense>

            {Config.STATS && (
                <Perf
                    deepAnalyze
                    style={{ zIndex: 90000 }}
                />
            )}
        </FiberCanvas>
    )
}