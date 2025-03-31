import Lights from "@components/Lights"
import MaterialLoader from "@components/world/materials/MaterialLoader"
import Config from "@data/Config"
import { Perf } from "r3f-perf"
import { CanvasProps, Canvas as FiberCanvas } from "@react-three/fiber"
import { Suspense } from "react"
import { BasicShadowMap, NoToneMapping } from "three"
import { useStore } from "@data/store"
import { getZoom } from "@components/Camera"
import Viewport, { getDpr } from "./Viewport"
import ShaderLoader from "@components/world/materials/ShaderLoader"

export default function Canvas({ children, ...rest }: CanvasProps) {
    let ready = useStore((i) => i.ready)

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
            dpr={getDpr()}
            {...rest}
        >
            <Viewport>
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
            </Viewport>
        </FiberCanvas>
    )
} 