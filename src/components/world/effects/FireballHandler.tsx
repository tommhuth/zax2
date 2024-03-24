import { useEffect, useMemo } from "react"
import InstancedMesh from "../models/InstancedMesh"
import { useShader } from "../../../data/hooks"
import { InstancedMesh as InstancedMeshThree } from "three"
import { clamp, glsl, ndelta, setBufferAttribute, setMatrixAt } from "../../../data/utils"
import easings from "../../../shaders/easings.glsl"
import dither from "../../../shaders/dither.glsl"
import noise from "../../../shaders/noise.glsl"
import utils from "../../../shaders/utils.glsl"
import { useFrame } from "@react-three/fiber"
import { blend, easeInOutCubic, easeOutCubic, easeOutQuart } from "../../../data/shaping" 
import { useStore } from "../../../data/store"
import { Fireball } from "../../../data/types"
import { Tuple3 } from "../../../types"

type TransformReturn = { scale: number, position: Tuple3 }
type FireballTransformer = (fireball: Fireball, delta: number, instance: InstancedMeshThree) => TransformReturn

export const transformer: Record<Exclude<Fireball["type"], undefined>, FireballTransformer> = {
    primary: (fireball) => {
        let t = clamp(fireball.time / fireball.lifetime, 0, 1)
        let scale = blend([fireball.startRadius, fireball.maxRadius, 0], easeOutQuart(t))

        if (fireball.time < 0) {
            scale = 0
        }  

        let position: Tuple3 = [
            fireball.position[0],
            fireball.position[1] + t * (fireball.index % 3 + 1) ,
            fireball.position[2],
        ]

        return { scale, position }
    },
    secondary: (fireball, delta) => {
        let introDur = 250
        let t = easeInOutCubic (1 -  clamp((fireball.time - introDur) / (fireball.lifetime-introDur), 0, 1))

        if (fireball.time < introDur) {
            t = easeOutCubic (clamp(fireball.time/introDur, 0, 1))
        }

        let scale = fireball.startRadius * t 

        if (fireball.time < 0) {
            scale = 0
        }   else {
            fireball.position[1] -= 1.5* fireball.startRadius * delta 
        }

        let position: Tuple3 = [
            fireball.position[0],
            fireball.position[1],
            fireball.position[2],
        ]

        return { scale, position }
    }
}

export default function FireballHandler() {
    let count = 250
    let centerAttributes = useMemo(() => {
        return new Float32Array(new Array(count * 3).fill(0))
    }, [count])
    let lifetimeAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let radiusAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let { onBeforeCompile, uniforms } = useShader({ 
        shared: glsl`
            varying float vRadius;
            varying float vDistance;
            varying float vLifetime;
            varying vec3 vGlobalPosition; 
            uniform float uTime;       
                 
            ${noise}
            ${easings} 
            ${dither}
            ${utils}
        `,
        uniforms: { 
            uTime: { value: 0 },
        },
        vertex: {
            head: glsl` 
                attribute vec3 aCenter;   
                attribute float aRadius;   
                attribute float aLifetime;   
            `,
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);   
                float noiseEffect = noise(globalPosition.xyz * .96)  ;

                transformed *= 1. + noiseEffect * .15; 
 
                vDistance = clamp(length(globalPosition.xyz - aCenter) / aRadius, 0., 1.);
                vLifetime = aLifetime;
                vGlobalPosition = globalPosition.xyz; 
                vRadius = aRadius;  
            `
        },
        fragment: { 
            main: glsl`      
                float noiseEffect = (noise(vGlobalPosition * .65 + uTime * 7.) + 1.) / 2.; 
                float edgeEffect = clamp(-dot(CAMERA_POSITION, normal), 0., 1.) ; 

                vec3 color = mix(
                    vec3(1., .4, 0.), 
                    vec3(1., .9, 0.), 
                    edgeEffect
                );

                gl_FragColor.rgb += .5;
                gl_FragColor.rgb *= color * 1.6;
                gl_FragColor.rgb = mix(vec3(0.8, 0.4, 0.), gl_FragColor.rgb, easeInOutQuad(noiseEffect)); 
                gl_FragColor.rgb = mix(vec3(1., 0., 0.), gl_FragColor.rgb, vDistance); 
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb * 1.2, 4., .05); 

                gl_FragColor.a = max(luma(gl_FragColor.rgb), .65);
            `
        }
    })

    // main
    useFrame((state, delta) => {
        let {
            effects: { explosions },
            instances: { fireball: { mesh: instance } }
        } = useStore.getState() 

        if (!instance) {
            return
        }

        for (let { fireballs } of explosions) {
            for (let fireball of fireballs) {
                let type = fireball.type || "primary"
                let result = transformer[type](fireball, ndelta(delta), instance)
 
                setBufferAttribute(instance.geometry, "aLifetime", fireball.time / fireball.lifetime, fireball.index)
                setMatrixAt({
                    instance: instance,
                    index: fireball.index,
                    ...result,
                })

                fireball.time += ndelta(delta) * 1000
            }
        } 
    })

    let latestExplosion = useStore(i => i.effects.explosions[0])
    let instance = useStore(i => i.instances.fireball?.mesh)
 
    useEffect(() => {
        if (!instance || !latestExplosion) {
            return
        }
 
        for (let fireball of latestExplosion.fireballs) {
            setBufferAttribute(instance.geometry, "aCenter", latestExplosion.position, fireball.index)
            setBufferAttribute(instance.geometry, "aRadius", latestExplosion.radius, fireball.index) 
        }
    }, [latestExplosion])
 
    useFrame((state, delta) => {
        uniforms.uTime.value += delta * .5
        uniforms.uTime.needsUpdate = true
    })

    return (

        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            count={count} 
            name="fireball" 
        >
            <sphereGeometry args={[1, 24, 24]} >
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aCenter"
                    args={[centerAttributes, 3, false, 1]}
                />
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aRadius"
                    args={[radiusAttributes, 1, false, 1]}
                />
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aLifetime"
                    args={[lifetimeAttributes, 1, false, 1]}
                />
            </sphereGeometry>
            <meshPhongMaterial
                transparent 
                onBeforeCompile={onBeforeCompile}
                color={"#fff"}
                name="fireball"
            />
        </InstancedMesh>
    )
}