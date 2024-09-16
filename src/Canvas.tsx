import Lights from "@components/Lights"
import MaterialLoader from "@components/world/materials/MaterialLoader"
import Config from "@data/Config"
import { Perf } from "r3f-perf"
import { CanvasProps, Canvas as FiberCanvas } from "@react-three/fiber"
import { DPR, PIXEL_SIZE, ZOOM } from "@data/const"
import { Suspense, useEffect, useState } from "react"
import { NoToneMapping, VSMShadowMap } from "three"
import { useStore } from "@data/store"
import ShaderLoader from "./components/ShaderLoader"

// round up to full pixel
export let getSize = () => [
    Math.ceil(window.innerWidth / PIXEL_SIZE) * PIXEL_SIZE,
    Math.ceil(window.innerHeight / PIXEL_SIZE) * PIXEL_SIZE,
]

export default function Canvas({ children, ...rest }: CanvasProps) {
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
                type: VSMShadowMap,
            }}
            orthographic
            camera={{
                zoom: ZOOM,
                near: 1,
                far: 150,
            }}
            dpr={DPR}
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