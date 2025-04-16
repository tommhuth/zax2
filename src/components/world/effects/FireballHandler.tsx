import InstancedMesh from "../models/InstancedMesh"
import { InstancedMesh as InstancedMeshThree } from "three"
import { clamp, glsl, ndelta, setMatrixAt } from "../../../data/utils"
import easings from "../../../shaders/easings.glsl"
import dither from "../../../shaders/dither.glsl"
import noise from "../../../shaders/noise.glsl"
import utils from "../../../shaders/utils.glsl"
import { useFrame } from "@react-three/fiber"
import { useStore } from "../../../data/store"
import { Fireball } from "../../../data/types"
import { Tuple3 } from "../../../types.global"
import { blend, easeInOutCubic, easeOutCubic, easeOutQuart } from "@data/lib/shaping"
import { useShader } from "@data/lib/useShader"

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
            fireball.position[1] + t * (fireball.index % 3),
            fireball.position[2],
        ]

        return { scale, position }
    },
    secondary: (fireball, delta) => {
        let introDuration = 250
        let t = easeInOutCubic(1 - clamp((fireball.time - introDuration) / (fireball.lifetime - introDuration), 0, 1))

        if (fireball.time < introDuration) {
            t = easeOutCubic(clamp(fireball.time / introDuration, 0, 1))
        }

        let scale = fireball.startRadius * t

        if (fireball.time < 0) {
            scale = 0
        } else {
            fireball.position[1] -= 1.5 * fireball.startRadius * delta
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
    let { onBeforeCompile, uniforms } = useShader({
        shared: glsl` 
            varying vec3 vGlobalPosition; 
            varying vec3 vGlobalNormal; 
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
            main: glsl`
                vec4 globalPosition = instanceMatrix * vec4(transformed, 1.);   
                float noiseEffect = noise(globalPosition.xyz * .96)  ;

                transformed *= 1. + noiseEffect * .15; 
                vGlobalPosition = globalPosition.xyz;   
                vGlobalNormal = mat3(instanceMatrix) * normal;
            `
        },
        fragment: {
            main: glsl`      
                float noiseEffect = (noise(vGlobalPosition * .65 + uTime * 7.) + 1.) / 2.; 
                float edgeEffect = clamp(-dot(CAMERA_POSITION, normal), 0., 1.) ; 
                float intensity = easeInOutCubic(luma(gl_FragColor.rgb));
                vec3 baseShading = vec3(gl_FragColor.rgb);

                vec3 color = mix(
                    vec3(1., .4, 0.), 
                    vec3(1., .9, 0.), 
                    edgeEffect
                );

  
                gl_FragColor.rgb += .5;
                gl_FragColor.rgb *= color * 1.6;
                gl_FragColor.rgb = mix(vec3(0.8, 0.4, 0.), gl_FragColor.rgb, easeInOutQuad(noiseEffect));  
                gl_FragColor.rgb = mix(vec3(0.1, 0.1, 0.), gl_FragColor.rgb, intensity);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb * 1.2, 4., .05);  


                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    gl_FragColor.rgb * 1.2, 
                    clamp(-dot(vGlobalNormal, vec3(.3, -.75, .5)), 0., 1.)
                );

                gl_FragColor.a = luma(dither(gl_FragCoord.xy, baseShading * 1.6, 2., .05)); 
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

                setMatrixAt({
                    instance: instance,
                    index: fireball.index,
                    ...result,
                })

                fireball.time += ndelta(delta) * 1000
            }
        }
    })

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
            <sphereGeometry args={[1, 24, 24]} />
            <meshLambertMaterial
                transparent
                onBeforeCompile={onBeforeCompile}
                color={"#fff"}
                name="fireball"
            />
        </InstancedMesh>
    )
}