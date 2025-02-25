import { useThree } from "@react-three/fiber"
import { startTransition, useEffect } from "react"
import { Tuple2 } from "./types.global"
import { setDiagonal } from "@data/store/world"

export function getSize(): Tuple2 {
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

export default function Viewport({ children }) {
    let { gl, setDpr, setSize, viewport: { getCurrentViewport }, camera } = useThree()

    useEffect(() => {
        let tid: number
        let updateSize = () => {
            clearTimeout(tid)
            tid = setTimeout(() => {
                startTransition(() => {
                    let [width, height] = getSize()
                    let viewport = getCurrentViewport(camera)
                    let diagonal = Math.hypot(viewport.width, viewport.height)

                    setDpr(getDpr())
                    setSize(width, height, false)
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

    return children
}