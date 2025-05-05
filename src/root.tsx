import { createRoot as createRootUi } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { lazy } from "react"
import { createRoot, extend, RenderProps, events } from "@react-three/fiber"
import { getZoom } from "@components/Camera"
import { getCanvasSize, getDpr } from "./Canvas"
import { setActiveObject } from "./editor/data/actions"
import EditorUi from "./editor/ui/EditorUi"
import ZaxxUi from "@components/ui/Ui"
import extensions from "./extensions"

extend(extensions)

const isEditorMode = window.location.hash.includes("editor")
const canvasRoot = createRoot(document.getElementById("canvas") as HTMLCanvasElement)
const uiRoot = createRootUi(document.getElementById("ui") as HTMLDivElement)

async function configure(element: JSX.Element, props?: RenderProps<HTMLCanvasElement>) {
    await canvasRoot.configure({
        ...getConfiguration(),
        ...props
    })

    canvasRoot.render(element)
}

function getConfiguration() {
    let [width, height] = getCanvasSize()

    return {
        camera: {
            zoom: getZoom(),
            near: -5,
            far: 150,
            position: [0, 0, 0],
        },
        flat: true,
        orthographic: true,
        shadows: "basic",
        dpr: getDpr(),
        onPointerMissed: () => {
            setActiveObject(null)
        },
        size: {
            width,
            height,
            top: 0,
            left: 0
        },
        gl: {
            antialias: false,
            depth: true,
            stencil: false,
            alpha: false,
            powerPreference: "high-performance",
        },
    } satisfies RenderProps<HTMLCanvasElement>
}

window.addEventListener("resize", () => {
    canvasRoot.configure(getConfiguration())
})

if (isEditorMode) {
    const Editor = lazy(() => import("./Editor"))

    document.title = "Zax Editor"

    configure(<Editor />, { events })
    uiRoot.render(<EditorUi />)
} else {
    const Zaxx = lazy(() => import("./Zaxx"))

    configure(<Zaxx />)
    uiRoot.render(<ZaxxUi />)
}

let updateSW = registerSW({
    onNeedRefresh() {
        console.info("New services worker ready")
        updateSW(true)
    },
    onOfflineReady() {
        console.info("Ready to work offline")
    },
}) 