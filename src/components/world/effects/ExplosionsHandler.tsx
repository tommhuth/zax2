import { startTransition, useEffect, useMemo } from "react"
import { LinearFilter } from "three"
import { glsl } from "../../../data/utils"
import { useShader } from "../../../data/hooks"
import { useFrame, useLoader } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { TextureLoader } from "three/src/loaders/TextureLoader.js"
import { useStore } from "../../../data/store"
import { removeExplosion } from "../../../data/store/effects"
import dither from "../../../shaders/dither.glsl"
import BlastHandler from "./BlastHandler"
import FireballHandler from "./FireballHandler"
import ShockwaveHandler from "./ShockwaveHandler"

export default function ExplosionsHandler() {
    let impactCount = 15 
    let [impactMap] = useLoader(TextureLoader, ["/textures/decal1.png"])
    let impactOpacityAttributes = useMemo(() => {
        return new Float32Array(new Array(impactCount).fill(0))
    }, [impactCount]) 
    let impactShader = useShader({
        vertex: {
            head: glsl`
                attribute float aOpacity;
                varying float vOpacity;
            `,
            main: glsl`
                vOpacity = aOpacity;
            `
        },
        fragment: {
            head: glsl`
                varying float vOpacity;
                
                ${dither} 
            `,
            main: glsl` 
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 2., .0105);
                gl_FragColor.a *= vOpacity;
            `
        },
    })

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
                name="impact"
                count={impactCount}
                castShadow={false}
                receiveShadow
                colors
            >
                <planeGeometry args={[2, 2, 1, 1]} >
                    <instancedBufferAttribute
                        needsUpdate={true}
                        attach="attributes-aOpacity"
                        args={[impactOpacityAttributes, 1, false, 1]}
                    />
                </planeGeometry>
                <meshBasicMaterial
                    map={impactMap}
                    color={"black"}
                    name="impact"
                    depthWrite={false}
                    transparent
                    onBeforeCompile={impactShader.onBeforeCompile}
                />
            </InstancedMesh>
        </>
    )
} 