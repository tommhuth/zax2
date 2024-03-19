import { clamp, glsl, ndelta, setMatrixAt } from "../../../data/utils"
import { useShader } from "../../../data/hooks"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { useStore } from "../../../data/store" 
import easings from "../../../shaders/easings.glsl"
import dither from "../../../shaders/dither.glsl"
import { easeInQuad } from "../../../data/shaping"

export default function BlastHandler() {
    let count = 20
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl` 
                varying vec3 vGlobalNormal;
            `,
            main: glsl` 
                vGlobalNormal = normal;
            `
        },
        fragment: {
            head: glsl`   
                varying float vOpacity;  
                varying vec3 vGlobalNormal;
                varying float vDistanceFromCenter;   

                ${easings}
                ${dither}

                float luma(vec3 color) {
                    return dot(color, vec3(0.299, 0.587, 0.114));
                }
            `,
            main: glsl`  
                // this isnt accurate is it -- or is ittt???
                vec3 cameraDirection = normalize(vec3(-57.2372, 50., -61.237));
                float directionToCamera = 1. - clamp(1. - dot(cameraDirection, vGlobalNormal), .0, 1.);
 
                gl_FragColor.rgb = mix(
                    vec3(1., .5, 0.), 
                    vec3(1., .9, 0.), 
                    easeInOutQuad(directionToCamera)
                ) * 1.05;

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    vec3(1., 1., 1.), 
                    easeInOutSine(clamp((directionToCamera - .75) / .25, 0., 1.))
                );
                    
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb + .2, 4., .01);
                gl_FragColor.a = luma(dither(gl_FragCoord.xy, vec3(directionToCamera) * 1.2 + .1, 4., .01));  
            `
        }
    })
 
    useFrame((state, delta) => {
        let {
            effects: { explosions },
            instances: { blast: instance }
        } = useStore.getState() 

        if (!instance) {
            return
        }

        for (let { blast, position } of explosions) { 
            let t = 1 - clamp(blast.time / (blast.lifetime), 0, 1)

            setMatrixAt({
                instance: instance.mesh,
                index: blast.index,
                position: [position[0], position[1], position[2]],
                scale: blast.radius * easeInQuad(t),
            })

            blast.time += ndelta(delta) * 1000
        } 
    })

    return (

        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            count={count}
            name="blast"
            colors 
        >
            <sphereGeometry args={[1, 16, 16]} />
            <meshLambertMaterial
                name="blast"
                onBeforeCompile={onBeforeCompile}
                transparent
                depthWrite={false}
            />
        </InstancedMesh>
    )
}