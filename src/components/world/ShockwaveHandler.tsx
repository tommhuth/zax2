import { useMemo } from "react"
import { BufferAttribute } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../data/utils"
import { useShader } from "../../data/hooks"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "./models/InstancedMesh"
import { useStore } from "../../data/store"
import easings from "../../shaders/easings.glsl"
import dither from "../../shaders/dither.glsl"
import { easeInQuad, easeInQuint, easeOutCubic, easeOutExpo, easeOutQuad, easeOutQuart } from "../../data/shaping"

export default function ShockwaveHandler() {
    let count = 20
    let opacityAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl` 
                attribute float aOpacity;  
                varying float vOpacity;  
                varying float vDistanceFromCenter;   
            `,
            main: glsl`
                vOpacity = aOpacity;
                vDistanceFromCenter = clamp(length(vec3(0., 0., 0.) - position) / .5, 0., 1.); 
            `
        },
        fragment: {
            head: glsl`   
                varying float vOpacity;  
                varying float vDistanceFromCenter;   

                ${easings}
                ${dither} 

                float luma(vec3 color) {
                    return dot(color, vec3(0.299, 0.587, 0.114));
                }
            `,
            main: glsl`     
                gl_FragColor.rgb = mix(vec3(0.), vec3(1.) * 1.5, easeInQuad(vDistanceFromCenter) * vOpacity);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 1., .05);
                gl_FragColor.a = luma(gl_FragColor.rgb);
            `
        }
    })

    // main
    useFrame((state, delta) => {
        let {
            effects: { explosions },
            instances: { shockwave: instance }
        } = useStore.getState()

        if (!instance) {
            return
        }

        for (let { shockwave, position } of explosions) {
            if (shockwave) {
                let t = clamp(shockwave.time / (shockwave.lifetime), 0, 1)
                let t2 = clamp((shockwave.time   ) / (shockwave.lifetime ), 0, 1)
                let opacityAttribute = instance.mesh.geometry.attributes.aOpacity as BufferAttribute

                // easeInQuad(1 - t)
                opacityAttribute.set([ easeOutQuad(1 - t2)], shockwave.index)
                opacityAttribute.needsUpdate = true

                setMatrixAt({
                    instance: instance.mesh,
                    index: shockwave.index,
                    position: [position[0], position[1] + 1, position[2]],
                    scale: easeOutCubic(t) * shockwave.radius + 2,
                })

                shockwave.time += ndelta(delta) * 1000
            }
        }
    })

    return (
        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            count={count}
            name="shockwave"
            colors
        >
            <cylinderGeometry args={[1, 1, .01, 32, 1]}>
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aOpacity"
                    args={[opacityAttributes, 1, false, 1]}
                />
            </cylinderGeometry>
            <meshBasicMaterial
                color="#fff"
                name="shockwave"
                depthWrite={false}
                transparent
                onBeforeCompile={onBeforeCompile}
            />
        </InstancedMesh>
    )
}