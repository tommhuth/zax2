import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { DirectionalLight, PointLight } from "three"
import { useStore } from "../data/store"
import Counter from "../data/world/Counter"



export default function Lights() {
    let counter = useMemo(() => new Counter(1), [])
    let shadowLightRef = useRef<DirectionalLight>(null)
    let engineLightRef = useRef<PointLight>(null)
    let explosionLightRef1 = useRef<PointLight>(null)
    let explosionLightRef2 = useRef<PointLight>(null)
    let explosionLights = [explosionLightRef1, explosionLightRef2]
    let { scene, viewport } = useThree()
    let lastExplosion = useStore(i => i.effects.explosions[0])
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

    useFrame(() => {
        let player = useStore.getState().player.object

        if (player && engineLightRef.current) {
            engineLightRef.current.position.z = player?.position.z - 1
            engineLightRef.current.position.y = player?.position.y + 1
            engineLightRef.current.position.x = player?.position.x
        }
    })

    useLayoutEffect(() => {
        if (! explosionLightRef1.current || !explosionLightRef2.current) {
            return 
        }

        explosionLightRef1.current.intensity = 0
        explosionLightRef2.current.intensity = 0
    }, [])

    useEffect(() => {
        if (lastExplosion) {
            let light = explosionLights[counter.current].current

            if (light) {
                light.intensity = 150
                light.distance = Math.max(lastExplosion.radius, 5) * 1.5
                light.position.set(...lastExplosion.position)
                light.position.y += 3
            }

            counter.next()
        }
    }, [lastExplosion])

    useFrame(() => {
        for (let light of explosionLights) {
            if (light.current) {
                light.current.intensity *= .9 //* 60 * delta 
            }
        }
    })

    return (
        <>
            <pointLight
                ref={engineLightRef}
                distance={30}
                position-y={3}
                intensity={35} //25} 
                color={"#ffffff"}
            />

            <pointLight
                ref={explosionLightRef1}
                color={"#fff"}
            />
            <pointLight
                ref={explosionLightRef2}
                color={"#fff"}
            />

            <directionalLight position={[13, 6, 10]} intensity={.4} /> 
            
            <directionalLight
                ref={shadowLightRef}
                color={"#b4e2ff"}
                position={[0, 15, 0]}
                intensity={.6}
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
        </>
    )
}