import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { DirectionalLight, PointLight } from "three"
import { useStore } from "../data/store"

export default function Lights() {
    let lightRef = useRef<DirectionalLight>(null)
    let explosionLightRef = useRef<PointLight>(null)
    let { scene, viewport } = useThree()
    let ticks = useRef(0)
    let explosion = useStore(i => i.effects.explosions[0])
    let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)

    useEffect(() => {
        if (!lightRef.current) {
            return
        }

        scene.add(lightRef.current.target)
    }, [scene])

    useEffect(() => {
        if (explosionLightRef.current && explosion) {
            explosionLightRef.current.intensity = 30
            explosionLightRef.current.position.set(
                explosion.position[0],
                explosion.position[1] + 2,
                explosion.position[2],
            )
        }
    }, [explosion])

    useFrame((state, delta) => {
        let player = useStore.getState().player.object

        if (lightRef.current && player && ticks.current > 1500) {
            lightRef.current.position.z = player.position.z
            lightRef.current.target.position.z = player.position.z
            ticks.current = 0
        } else {
            ticks.current += delta * 1000
        }

        if (explosionLightRef.current) {
            explosionLightRef.current.intensity *= .8
        }
    })

    return (
        <>
            <directionalLight
                color={"#89daff"}
                position={[-10, 20, -25]}
                intensity={0}
            />
            <directionalLight
                color={"#001aff"}
                position={[-10, 0, 0]}
                intensity={1.8}
            />
            <directionalLight
                color={"#00eacb"}
                position={[0, 0, -10]}
                intensity={1.8}
            />
            <directionalLight
                ref={lightRef}
                color={"#e8f6ff"}
                position={[0, 15, 0]}
                intensity={2}
                castShadow
                shadow-radius={1.5}
                shadow-camera-near={0} // y
                shadow-camera-far={15}
                shadow-camera-left={-8} // x
                shadow-camera-right={8}
                shadow-camera-top={diagonal * .5} // z
                shadow-camera-bottom={-diagonal * 1.75}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            />
            <pointLight
                color={"blue"}
                ref={explosionLightRef}
                distance={8}
            />
            <hemisphereLight intensity={.0} color={"#00bfff"} groundColor={"blue"} />
            <ambientLight intensity={.5} color={"#00f"} />
        </>
    )
}