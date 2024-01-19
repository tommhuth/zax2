import { useShader } from "../../../../data/hooks"
import { glsl } from "../../../../data/utils"
import InstancedMesh from "../InstancedMesh"
import dither from "../../../../shaders/dither.glsl"
import easings from "../../../../shaders/easings.glsl"

export default function Exhaust() {
    let { onBeforeCompile, customProgramCacheKey } = useShader({
        vertex: {
            head: glsl`
                varying vec3 vPosition;
            `,
            main: glsl`
                vPosition = position;
            `
        },
        fragment: {
            head: glsl`
                varying vec3 vPosition;

                ${dither}
                ${easings}

                float luma(vec3 color) {
                    return dot(color, vec3(0.299, 0.587, 0.114));
                }
            `,
            main: glsl` 
                gl_FragColor.rgb = mix(vec3(0., .85, 1.), vec3(1.), (vPosition.y  + 1.) / 2. * 1.1 + .25);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 4., .05);
 
                gl_FragColor.a = luma(
                    dither(gl_FragCoord.xy, mix(vec3(0.), vec3(1.), easeOutCubic(clamp((vPosition.y + 1.) / 2., 0. ,1.)) * 1.1 + .25), 1., .05)
                ); 
            `
        }
    })

    return (
        <InstancedMesh
            name="exhaust"
            count={10}
            colors={false}
        >
            <sphereGeometry attach={"geometry"} args={[1, 20, 20]} />
            <meshBasicMaterial 
                transparent
                dithering 
                name="exhaust"
                attach={"material"} 
                depthWrite={false}
                onBeforeCompile={onBeforeCompile}
                customProgramCacheKey={customProgramCacheKey}
            />
        </InstancedMesh>
    )
}