import { useMemo } from "react"
import { clamp, glsl, ndelta, setBufferAttribute, setMatrixAt } from "../../../data/utils"
import { useShader } from "../../../data/hooks"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { useStore } from "../../../data/store"
import easings from "../../../shaders/easings.glsl"
import dither from "../../../shaders/dither.glsl"
import utils from "../../../shaders/utils.glsl"
import { easeOutCubic } from "../../../data/shaping"

export default function ShockwaveHandler() {
    let count = 20
    let opacityAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])
    let { onBeforeCompile } = useShader({
        shared: glsl`
            varying float vTime;  
            varying float vDistanceFromCenter;   
            ${easings}
            ${dither} 
            ${utils}  
        `,
        vertex: {
            head: glsl` 
                attribute float aTime;  
            `,
            main: glsl`
                vTime = aTime;
                vDistanceFromCenter = clamp(length(vec3(0., 0., 0.) - position) / 1., 0., 1.); 
            `
        },
        fragment: {
            main: glsl`     
                gl_FragColor.rgb = mix(
                    vec3(0.), 
                    vec3(1.) * 1.5, 
                    easeInCubic(vDistanceFromCenter) * easeOutQuart(1. - vTime)
                );
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 1., .08);
                gl_FragColor.a = luma(gl_FragColor.rgb);
            `
        }
    })

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

                setBufferAttribute(instance.mesh.geometry, "aTime", t, shockwave.index)
                setMatrixAt({
                    instance: instance.mesh,
                    index: shockwave.index,
                    position,
                    scale: easeOutCubic(t) * shockwave.radius * 1.5 + 1,
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
        >
            <cylinderGeometry args={[1, 1, .01, 32, 1]}>
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aTime"
                    args={[opacityAttributes, 1, false, 1]}
                />
            </cylinderGeometry>
            <meshBasicMaterial
                color="#fff"
                name="shockwave"
                depthWrite={false}
                transparent
                forceSinglePass
                onBeforeCompile={onBeforeCompile}
            />
        </InstancedMesh>
    )
}