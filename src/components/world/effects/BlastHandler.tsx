import { clamp, glsl, ndelta, setMatrixAt } from "../../../data/utils"
import { useShader } from "../../../data/hooks"
import { useFrame } from "@react-three/fiber"
import InstancedMesh from "../models/InstancedMesh"
import { useStore } from "../../../data/store" 
import easings from "../../../shaders/easings.glsl"
import dither from "../../../shaders/dither.glsl"
import utils from "../../../shaders/utils.glsl" 
import { easeInBack, easeOutBack } from "../../../data/shaping"

export default function BlastHandler() {
    let count = 20 
    let { onBeforeCompile, customProgramCacheKey } = useShader({ 
        shared: glsl`
            varying vec3 vGlobalNormal;
            varying float vOpacity;   
            varying float vDistanceFromCenter;

            ${easings}
            ${dither}   
            ${utils}    
        `,
        vertex: { 
            main: glsl` 
                vGlobalNormal = normalize(mat3(instanceMatrix) * normal);
            `
        },
        fragment: { 
            main: glsl`   
                float v = directionToCamera(vGlobalNormal);
 
                gl_FragColor.rgb = mix(
                    vec3(0., 0., 1.), 
                    vec3(1., 1., 0.), 
                    easeInOutCubic(v)
                );  
                 
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb * 1.2, 6., .05);
                gl_FragColor.a = luma(dither(gl_FragCoord.xy, vec3(1. - v), 6., .05));  
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
            let t = 1 - clamp(blast.time / (blast.lifetime * .5), 0, 1)

            setMatrixAt({
                instance: instance.mesh,
                index: blast.index,
                position,
                scale: blast.radius * easeOutBack(t),
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
        >
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhongMaterial
                name="blast"
                onBeforeCompile={onBeforeCompile}
                transparent 
                depthWrite={false}
                customProgramCacheKey={customProgramCacheKey}
            />
        </InstancedMesh>
    )
}