import { useStore } from "@data/store"
import { setLoaded, setReady, setSetup } from "@data/store/utils"
import { setDiagonal } from "@data/store/world"
import { useThree } from "@react-three/fiber"
import { startTransition, useEffect } from "react"

export default function ShaderLoader() {
    let { scene, gl, camera, viewport: { getCurrentViewport } } = useThree()
    let loaded = useStore((i) => i.loaded)

    useEffect(() => {
        let tid: ReturnType<typeof setTimeout>
        let onResize = () => {
            clearTimeout(tid)
            tid = setTimeout(() => {
                let viewport = getCurrentViewport(camera)

                startTransition(() => setDiagonal(viewport.width))
            }, 150)
        }

        startTransition(onResize)
        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [camera, getCurrentViewport])

    useEffect(() => {
        // not sure this is really needed
        gl.compile(scene, camera)

        setTimeout(() => {
            startTransition(setLoaded)
        }, 2000)
    }, [scene, camera, gl])

    useEffect(() => {
        if (loaded) {
            startTransition(setSetup)
            let tid = setTimeout(() => {
                document.getElementById("loading")?.remove()
                startTransition(setReady)
            }, 1000)

            return () => {
                clearTimeout(tid)
            }
        }
    }, [loaded])

    return null
}