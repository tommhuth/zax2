import { Color, DoubleSide, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import dither from "../../../shaders/dither.glsl"
import easings from "../../../shaders/easings.glsl"
import noise from "../../../shaders/noise.glsl"
import { useShader } from "../../../data/hooks"
import { fogColor, grassColorEnd, grassColorStart } from "../../../data/theme"
import { glsl } from "../../../data/utils"
import { store } from "../../../data/store"

export const getGrassTransform = glsl`
    vec3 getGrassTransform(vec3 localPosition, vec3 globalPosition, vec3 playerPosition, mat4 modelMatrix) {
        vec3 transform = vec3(0.);
        float height = 1.75;
        float heightScale = easeInQuad(clamp(localPosition.y / height, 0., 1.));
        float offsetSize = .4;
        float timeScale = 2.;
        vec3 pp = vec3(playerPosition.x, globalPosition.y, playerPosition.z); 
        vec3 offsetNormal = inverse(mat3(modelMatrix)) * normalize(globalPosition - pp);
        float playerRadius = 6.;
        float offsetEffect = 1. - clamp(length(pp - globalPosition) / playerRadius, 0., 1.);
        float offsetHeightEffect = 1. - clamp((pp.y - 1.) / (height * 2. - 1.), 0., 1.);

        transform += offsetNormal 
            * easeInCubic(offsetEffect * .75) 
            * easeOutCubic(offsetHeightEffect) 
            * clamp(localPosition.y / height, 0., 1.) 
            * 2.; 

        transform.x += cos(globalPosition.x * .1 + uTime * timeScale) * heightScale * offsetSize;
        transform.x += sin(globalPosition.z * .6 + -uTime * timeScale) * heightScale * 1.5 * offsetSize; 
        transform.x += sin(globalPosition.z * .3 + -uTime * timeScale) * heightScale * .25 * offsetSize; 

        transform.z -= cos(globalPosition.z * .4 + uTime * timeScale * .3) * heightScale * .75 * offsetSize;
        transform.z += sin(globalPosition.x * .3 + -uTime * timeScale * .7) * heightScale * 1. * offsetSize; 
        transform.z -= sin(globalPosition.x * .15 + -uTime * timeScale * .5) * heightScale * .35 * offsetSize; 

        transform.y -= (sin((globalPosition.x + globalPosition.z) * .4) + 1.) / 2. * .85;

        return transform;
    }
`

export default function GrassMaterial() {
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: {
                value: 0,
            },
            uColorStart: {
                value: new Color(grassColorStart),
            },  
            uFogColor: {
                value: new Color(fogColor)
            },
            uColorEnd: {
                value: new Color(grassColorEnd),
            },
            uPlayerPosition: {
                value: new Vector3(),
            },
        },
        shared: glsl`
            uniform vec3 uPlayerPosition;
            uniform vec3 uColorStart;
            uniform vec3 uFogColor;
            uniform vec3 uColorEnd;
            varying vec3 vGlobalPosition;
            varying vec3 vPosition;
            uniform float uTime;

            ${dither}
            ${easings}
            ${noise}
            ${getGrassTransform} 
        `,
        vertex: {
            main: glsl`
                vGlobalPosition = (modelMatrix * vec4(position, 1.)).xyz;
                vPosition = position;

                transformed += getGrassTransform(position, vGlobalPosition, uPlayerPosition, modelMatrix);

                vGlobalPosition = (modelMatrix * vec4(transformed, 1.)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                float height = 1.75;   

                // base color
                gl_FragColor.rgb = mix(
                    uColorStart * 1.2, 
                    uColorEnd * 1.3, 
                    (clamp(vPosition.y / height, 0., 1.))
                ); 

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    vec3(1., .7, 0.), 
                    easeInOutCubic((noise(vGlobalPosition * .2 + uTime * .4) + 1.) / 2.) * .6
                ); 

                // fog
                vec3 n1 = vGlobalPosition * .1 + uTime * .2 * 1.4;
                float noiseEffect = easeInOutSine((noise(n1) + 1.) / 2.) * .8;
                float heightScaler = 1. - clamp((vGlobalPosition.y) / height * .6, 0., 1.);   
                
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    uFogColor, 
                    clamp(heightScaler + noiseEffect * (1. - heightScaler), 0., 1.) 
                );  

                gl_FragColor.a = clamp((vPosition.y) / .5, 0., 1.);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 11., .0071);  
            `
        }
    })

    useFrame(() => {
        let { effects, player } = store.getState()

        uniforms.uTime.value = effects.time
        uniforms.uTime.needsUpdate = true

        uniforms.uPlayerPosition.value.copy(player.position)
        uniforms.uPlayerPosition.needsUpdate = true
    })

    return (
        <meshPhongMaterial
            side={DoubleSide}
            name="grass"
            transparent
            color="white"
            onBeforeCompile={onBeforeCompile}
        />
    )
}