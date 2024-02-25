import { startTransition, useEffect } from "react"
import { LinearFilter } from "three"
import { glsl } from "../../../data/utils"
import { useFrame, useLoader } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader.js"
import { useStore } from "../../../data/store"
import { removeExplosion } from "../../../data/store/effects"
import BlastHandler from "./BlastHandler"
import FireballHandler from "./FireballHandler"
import ShockwaveHandler from "./ShockwaveHandler"
import { MeshRetroMaterial } from "../MeshRetroMaterial"

export default function ExplosionsHandler() {
    let decalCount = 15 
    let [impactMap] = useLoader(TextureLoader, ["/textures/decal1.png"]) 

    useEffect(() => {
        impactMap.magFilter = LinearFilter
        impactMap.minFilter = LinearFilter
    }, [impactMap]) 

    // main
    useFrame(() => { 
        let {
            effects: { explosions }, 
        } = useStore.getState()
        let dead: string[] = []

        for (let { shockwave, fireballs, blast, ...explosion } of explosions) { 
            let shockwaveDone = shockwave ? shockwave.time > shockwave.lifetime : true
            let blastDone = blast.time > blast.lifetime

            if (fireballs[0].time > fireballs[0].lifetime && shockwaveDone && blastDone) {
                dead.push(explosion.id)
                continue
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
                castShadow={false}
                receiveShadow
                colors
            >
                <planeGeometry args={[2, 2, 1, 1]} />
                <MeshRetroMaterial 
                    map={impactMap}
                    color={"black"}
                    name="impact"
                    depthWrite={false}
                    transparent 
                    fragmentShader={glsl`
                        gl_FragColor.rgb = vec3(0., 0., 0.); 
                        gl_FragColor.a *= .6; 
                    `}
                /> 
            </InstancedMesh>
        </>
    )
} 