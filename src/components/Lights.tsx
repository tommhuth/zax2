import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { DirectionalLight } from "three"
import { useStore } from "../data/store"

export default function Lights() {
    let shadowLightRef = useRef<DirectionalLight>(null)
    let { scene, viewport } = useThree()
    let ticks = useRef(0)
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        scene.add(shadowLightRef.current.target)
    }, [scene])

    useFrame((state, delta) => {
        let player = useStore.getState().player.object

        if (shadowLightRef.current && player && ticks.current > 1500) {
            shadowLightRef.current.position.z = player.position.z
            shadowLightRef.current.target.position.z = player.position.z
            ticks.current = 0
        } else {
            ticks.current += delta * 1000
        }
    }) 

    return (
        <> 
            <directionalLight position={[-6, 15, -6]} intensity={.8} />

            <directionalLight
                ref={shadowLightRef}
                color={"#ffffff"}
                position={[0, 15, 0]}
                intensity={.8}
                castShadow
                shadow-camera-near={0} // y
                shadow-camera-far={15}
                shadow-camera-left={-8} // x
                shadow-camera-right={14}
                shadow-camera-top={diagonal * .5} // z
                shadow-camera-bottom={-diagonal * 1.75}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.0001}
                shadow-blurSamples={12}
                shadow-radius={3}
            />
        </>
    )
}