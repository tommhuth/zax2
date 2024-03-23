import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { MeshBasicMaterial } from "three"
import random from "@huth/random"
import { useShader } from "../../../data/hooks"
import { glsl } from "../../../data/utils"
import dither from "../../../shaders/dither.glsl"
import easings from "../../../shaders/easings.glsl"
import noise from "../../../shaders/noise.glsl"

export default function ExhaustMaterial() {
    let ref = useRef<MeshBasicMaterial>(null)
    let { onBeforeCompile, uniforms } = useShader({
        cacheKey: "exhaust",
        uniforms: {
            uTime: { value: 0 }
        },
        vertex: {
            head: glsl`
                varying vec3 vPosition;
                varying vec3 vGlobalPosition;
            `,
            main: glsl`
                vPosition = position;
                vGlobalPosition = (modelMatrix * vec4(position, 1.)).xyz;
            `
        },
        fragment: {
            head: glsl`
                varying vec3 vPosition;
                varying vec3 vGlobalPosition;
                uniform float uTime;
                
                ${dither}
                ${easings}
                ${noise}

                float luma(vec3 color) {
                    return dot(color, vec3(0.299, 0.587, 0.114));
                }
            `,
            main: glsl`
                float grad = clamp((vPosition.z + .5 ) / 1., 0., 1.);
 
                gl_FragColor.rgb = mix(vec3(0., .85, 1.), vec3(1.), grad - cos(uTime * 24.) * .25);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb * 1.1 + .2, 4., .05);

                vec3 ditherGradient = mix(vec3(0.), vec3(1.), clamp((vPosition.z + .9 + .1 * cos(uTime * 19.)) / 1., 0., 1.)) + .2;
                    
                gl_FragColor.a = luma(
                    dither(
                        gl_FragCoord.xy, 
                        ditherGradient + noise(vGlobalPosition + vec3(0., 0., uTime) * 1.6) * .6 * (1. - clamp((vPosition.z + .5 ) / .75, 0., 1.)),
                        1., 
                        .05
                    )
                );  
            `
        }
    })

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.opacity = random.float(.85, 1)
        }

        uniforms.uTime.value += delta
        uniforms.uTime.needsUpdate = true
    })

    return (
        <meshBasicMaterial
            onBeforeCompile={onBeforeCompile}
            color="white"
            transparent 
            name="exhaust"
            ref={ref}
            depthWrite={false}
        />
    )
}