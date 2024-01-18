import { startTransition, useMemo } from "react"
import InstancedMesh from "./models/InstancedMesh"
import { useShader } from "../../data/hooks"
import { BufferAttribute, Color } from "three"
import { explosionCenterColor, explosionEndColor, explosionHighlightColor } from "../../data/theme"
import { clamp, glsl, ndelta, setMatrixAt } from "../../data/utils"
import easings from "../../shaders/easings.glsl"
import dither from "../../shaders/dither.glsl"
import noise from "../../shaders/noise.glsl"
import { useFrame } from "@react-three/fiber"
import { blend, easeOutQuart } from "../../data/shaping"
import { removeExplosion } from "../../data/store/effects"
import { useStore } from "../../data/store"

export default function FireballHandler() {
    let count = 150
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
        uniforms: {
            uEndColor: { value: new Color(explosionEndColor) },
            uCenterColor: { value: new Color(explosionCenterColor) },
            uHighlightColor: { value: new Color(explosionHighlightColor) },
            uTime: { value: 0 },
        },
        vertex: {
            head: glsl` 
                attribute vec3 aCenter;   
                attribute float aRadius;   
                varying float vRadius;
                varying float vDistance;
                varying float vLifetime;
                varying vec3 vGlobalPosition;
                attribute float aLifetime;   
                uniform float uTime;   
                 
                ${noise}
                ${easings}
            `,
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);   
                float noiseEffect = noise(globalPosition.xyz * .96)  ;

                transformed *= 1. + noiseEffect * .2; 
 
                vDistance = clamp(length(globalPosition.xyz - aCenter) / aRadius, 0., 1.); // );
                vLifetime = aLifetime;
                vGlobalPosition = globalPosition.xyz; 
                vRadius = aRadius;  
            `
        },
        fragment: {
            head: glsl`  
                varying float vDistance; 
                varying float vLifetime;
                varying float vRadius;
                varying vec3 vGlobalPosition; 
                uniform float uTime;    
                uniform vec3 uEndColor;   
                uniform vec3 uCenterColor;   
                uniform vec3 uHighlightColor;   
                 
                ${easings}
                ${noise}
                ${dither}

                float luma(vec3 color) {
                    return dot(color, vec3(0.299, 0.587, 0.114));
                }
            `,
            main: glsl`     
                // vec3 baseColor = mix(uEndColor, gl_FragColor.rgb, .5); 
                float noiseEffect = (noise(vGlobalPosition * .65 + uTime * 7.) + 1.) / 2.;
                vec3 cameraDirection = normalize(vec3(-57.2, -50., -61.2)); 
                float edgeEffect = clamp(-dot(cameraDirection, normal), 0., 1.) ; 

                vec3 color = mix(
                    vec3(1., .4, 0.), 
                    vec3(1., .9, 0.), 
                    edgeEffect
                );

                gl_FragColor.rgb += .5;
                gl_FragColor.rgb *= color * 1.6;
                gl_FragColor.rgb = mix(vec3(0.8, 0.4, 0.), gl_FragColor.rgb, easeInOutQuad(noiseEffect)); 
                
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
        let dead: string[] = []

        if (!instance) {
            return
        }

        for (let { fireballs } of explosions) {
            for (let sphere of fireballs) {
                let t = clamp(sphere.time / sphere.lifetime, 0, 1)
                let scale = blend([sphere.startRadius, sphere.maxRadius, 0], easeOutQuart(t))

                if (sphere.time < 0) {
                    scale = 0
                }

                let attribute = instance.geometry.attributes.aLifetime as BufferAttribute

                attribute.set([t], sphere.index)
                attribute.needsUpdate = true

                setMatrixAt({
                    instance: instance,
                    index: sphere.index,
                    position: [
                        sphere.position[0],
                        sphere.position[1] + t * (sphere.index % 3 + 1),
                        sphere.position[2],
                    ],
                    scale
                })

                sphere.time += ndelta(delta) * 1000
            }
        }

        if (dead.length) {
            startTransition(() => removeExplosion(dead))
        }
    })

    // init
    /*
    useEffect(() => {
        if (!instance || !latestExplosion) {
            return
        }

        let centerAttribute = instance.geometry.attributes.aCenter as BufferAttribute
        let radiusAttribute = instance.geometry.attributes.aRadius as BufferAttribute

        for (let fireball of latestExplosion.fireballs) {
            centerAttribute.setXYZ(fireball.index, ...latestExplosion.position)
            centerAttribute.needsUpdate = true

            radiusAttribute.set([latestExplosion.radius], fireball.index)
            radiusAttribute.needsUpdate = true
        }
    }, [latestExplosion])
    */

    // glow anim
    useFrame((state, delta) => {
        uniforms.uTime.value += delta
        uniforms.uTime.needsUpdate = true
    })

    return (

        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            count={count}
            name="fireball"
        //visible={false}
        >
            <sphereGeometry args={[1, 32, 32]} >
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