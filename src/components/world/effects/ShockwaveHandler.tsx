import { useMemo } from "react"
import { clamp, glsl, list, ndelta, setBufferAttribute, setMatrixAt } from "../../../data/utils"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { useStore } from "../../../data/store"
import dither from "../../../shaders/dither.glsl"
import noise from "../../../shaders/noise.glsl"
import utils from "../../../shaders/utils.glsl"
import { useShader } from "@data/lib/useShader"
import { easeOutCubic } from "@data/lib/shaping"

export default function ShockwaveHandler() {
    let count = 20
    let opacityAttributes = useMemo(() => {
        return new Float32Array(list(count, 0))
    }, [count])
    let { onBeforeCompile } = useShader({
        shared: glsl`
            varying float vTime;  
            varying vec3 vPosition;   
            ${noise}
            ${dither} 
            ${utils}  
        `,
        vertex: {
            head: glsl` 
                attribute float aTime;  
            `,
            main: glsl`
                vTime = aTime;
                vPosition = position;  
            `
        },
        fragment: {
            main: glsl`     
                float innerRadius = smoothstep(.7, 1., vTime);
                float outerRadius = .95 + innerRadius * .2;
                float dist = smoothstep(innerRadius  , outerRadius, length(vPosition)); 

                gl_FragColor.rgb = mix(
                    vec3(0.), 
                    vec3(1.15), 
                    dist - ((noise(gl_FragCoord.xy * .035) + 1.) / 2.) * (1. - length(vPosition)) * .5
                );
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 1., .035);
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
                    scale: easeOutCubic(t) * shockwave.radius, //  easeOutCubic(t) *
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
            renderOrder={1}
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
                transparent
                depthWrite={false}
                onBeforeCompile={onBeforeCompile}
            />
        </InstancedMesh>
    )
}