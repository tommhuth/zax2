import Lights from "@components/Lights"
import MaterialLoader from "@components/world/materials/MaterialLoader"
import { CanvasProps, useThree } from "@react-three/fiber"
import { startTransition, Suspense, useEffect } from "react"
import { useStore } from "@data/store"
import ShaderLoader from "@components/world/materials/ShaderLoader"
import { setDiagonal } from "@data/store/world"
import { Tuple2 } from "./types.global"

export function getCanvasSize(): Tuple2 {
    // round up to full pixel
    return [
        Math.ceil(window.innerWidth / getPixelSize()) * getPixelSize(),
        Math.ceil(window.innerHeight / getPixelSize()) * getPixelSize(),
    ]
}

export function getPixelSize() {
    return Math.min(window.innerWidth, window.innerHeight) < 800 ? 3 : 4
}

export function getDpr() {
    const pixelSize = getPixelSize()

    return 1 / pixelSize
}

export default function Canvas({ children }: CanvasProps) {
    let ready = useStore((i) => i.ready)
    let { gl, setDpr, setSize, viewport: { getCurrentViewport }, camera } = useThree()

    useEffect(() => {
        let tid: number
        let updateSize = () => {
            clearTimeout(tid)
            tid = setTimeout(() => {
                startTransition(() => {
                    let [width, height] = getCanvasSize()
                    let viewport = getCurrentViewport(camera)
                    let diagonal = Math.hypot(viewport.width, viewport.height)

                    setDpr(getDpr())
                    setSize(width, height)
                    setDiagonal(diagonal)

                    gl.domElement.style.width = width + "px"
                    gl.domElement.style.height = height + "px"
                })
            }, 100)
        }

        screen.orientation.addEventListener("change", updateSize)
        window.addEventListener("resize", updateSize)

        updateSize()

        return () => {
            screen.orientation.removeEventListener("change", updateSize)
            window.removeEventListener("resize", updateSize)
        }
    }, [setDpr, gl, setSize, getCurrentViewport, camera])


    useEffect(() => {
        if (ready) {
            let canvas = document.getElementById("canvas")

            if (canvas) {
                canvas.style.opacity = "1"
            }
        }
    }, [ready])

    return (
        <>
            <Lights />
            <MaterialLoader />

            <Suspense>
                <ShaderLoader />
                {children}
            </Suspense>
        </>
    )
}