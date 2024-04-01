import { startTransition, useEffect, useMemo, useRef } from "react"
import { LinearFilter, PointLight } from "three"
import { glsl, ndelta } from "../../../data/utils"
import { useFrame, useLoader } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader.js"
import { store, useStore } from "../../../data/store"
import { removeExplosion } from "../../../data/store/effects"
import BlastHandler from "./BlastHandler"
import FireballHandler from "./FireballHandler"
import ShockwaveHandler from "./ShockwaveHandler"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import Counter from "../../../data/world/Counter"
import { damp } from "three/src/math/MathUtils.js"

export default function ExplosionsHandler() {
    let decalCount = 15 
    let [impactMap] = useLoader(TextureLoader, ["/textures/decal1.png"])  
    let explosionLightRef1 = useRef<PointLight>(null)
    let explosionLightRef2 = useRef<PointLight>(null)
    let explosionLights = [explosionLightRef1, explosionLightRef2] 
    let counter = useMemo(() => new Counter(1), [])
    let diagonal = useStore(i => i.world.diagonal)

    useEffect(() => {
        if (!explosionLightRef1.current || !explosionLightRef2.current) {
            return
        }

        explosionLightRef1.current.intensity = 0
        explosionLightRef2.current.intensity = 0
    }, [])

    // light update
    useEffect(() => {
        return store.subscribe(
            (state) => state.effects.explosions[0],
            (lastExplosion) => {
                if (lastExplosion?.radius > .5) {
                    let light = explosionLights[counter.current].current
        
                    if (light) {
                        light.intensity = 40
                        light.distance = lastExplosion.radius * 16
                        light.position.set(...lastExplosion.position)
                        light.position.y += 2
                    }
        
                    counter.next()
                }
            }
        ) 
    }, [])

    // lightout
    useFrame((state, delta) => {
        for (let light of explosionLights) {
            if (light.current) {
                light.current.intensity = damp(light.current.intensity, 0, 3, delta)
            }
        }
    }) 

    // main
    useFrame((state, delta) => { 
        let {
            effects: { explosions },  player
        } = useStore.getState()
        let dead: string[] = [] 

        for (let explosion of explosions) {  
            let outside = explosion.position[2] < player.position.z - diagonal

            if (outside || explosion.time > explosion.lifetime) {
                dead.push(explosion.id)
                continue
            }  else {
                explosion.time += ndelta(delta) * 1000
            }
        }

        if (dead.length) {
            startTransition(() => removeExplosion(dead))
        }
    })

    return (
        <>
            <BlastHandler />
            <FireballHandler />
            <ShockwaveHandler />

            <InstancedMesh
                name="decal"
                count={decalCount}  
            >
                <planeGeometry args={[2, 2, 1, 1]} />
                <MeshRetroMaterial  
                    color={"black"}
                    name="impact"
                    depthWrite={false}
                    transparent  
                    shader={{
                        fragment: {
                            main: glsl`
                                gl_FragColor.rgb = vec3(0., 0., 0.); 
                                gl_FragColor.a *= .7; 
                            `
                        }
                    }}
                >
                    <primitive 
                        object={impactMap} 
                        attach="map" 
                        magFilter={LinearFilter}
                        minFilter={LinearFilter}
                    />
                </MeshRetroMaterial> 
            </InstancedMesh> 

            <pointLight
                ref={explosionLightRef1}
                color={"#fff"}
            />
            <pointLight
                ref={explosionLightRef2}
                color={"#fff"}
            />
        </>
    )
} 