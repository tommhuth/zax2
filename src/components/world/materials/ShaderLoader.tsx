import { useStore } from "@data/store"
import { setLoaded, setReady, setSetup } from "@data/store/utils"
import { useThree } from "@react-three/fiber"
import { startTransition, useEffect } from "react"

export default function ShaderLoader() {
    let { scene, gl, camera } = useThree()
    let loaded = useStore((i) => i.loaded)

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