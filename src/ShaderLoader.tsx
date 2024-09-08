import { useStore } from "@data/store"
import { setLoaded, setReady, setSetup } from "@data/store/utils"
import { setDiagonal } from "@data/store/world"
import { useThree } from "@react-three/fiber"
import { startTransition, useEffect } from "react"

export default function ShaderLoader() {
    let { scene, gl, camera, viewport: { getCurrentViewport } } = useThree()
    let loaded = useStore((i) => i.loaded) 
 
    useEffect(() => { 
        let onResize = () => {
            let viewport = getCurrentViewport(camera) 
    
            startTransition(() => setDiagonal(Math.hypot(viewport.width, viewport.height)))
        } 

        startTransition(onResize)
        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    useEffect(() => {
        // not sure this is really needed
        gl.compile(scene, camera)  

        setTimeout(() => { 
            startTransition(setLoaded)
        }, 2000)
    }, [scene, camera])

    useEffect(() => { 
        if (loaded) {  
            startTransition(setSetup)
            setTimeout(() => { 
                document.getElementById("loading")?.remove()
                startTransition(setReady)
            }, 1000)  
        }
    }, [loaded])

    return null
}