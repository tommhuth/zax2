import { Color, DoubleSide, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import dither from "../../../shaders/dither.glsl"
import easings from "../../../shaders/easings.glsl"
import noise from "../../../shaders/noise.glsl"
import { fogColor, grassColorEnd, grassColorStart } from "../../../data/theme"
import { glsl } from "../../../data/utils"
import { store } from "../../../data/store"
import { lightFragment, lightFragmentHead, makeLightUniforms, useLightsUpdater } from "./helpers"
import { useShader } from "@data/lib/useShader"

export const getGrassTransform = glsl` 
    vec3 getGrassTransform(vec3 localPosition, vec3 globalPosition, vec3 playerPosition, mat4 modelMatrix) {
        vec3 transform = vec3(localPosition);
        float height = 1.75;
        float heightScale = easeInQuad(clamp(localPosition.y / height, 0., 1.));
        float offsetSize = .4;
        float timeScale = 2.;
 
        transform.x += cos(globalPosition.x * .1 + uTime * timeScale) * heightScale * offsetSize;
        transform.x += sin(globalPosition.z * .6 + -uTime * timeScale) * heightScale * 1.5 * offsetSize; 
        transform.x += sin(globalPosition.z * .3 + -uTime * timeScale) * heightScale * .25 * offsetSize; 

        transform.z -= cos(globalPosition.z * .4 + uTime * timeScale * .3) * heightScale * .75 * offsetSize;
        transform.z += sin(globalPosition.x * .3 + -uTime * timeScale * .7) * heightScale * 1. * offsetSize; 
        transform.z -= sin(globalPosition.x * .15 + -uTime * timeScale * .5) * heightScale * .35 * offsetSize;  

        transform.y -= sin(length(globalPosition.xz * .5))  
            * cos(globalPosition.x * .3) ;

        float playerRadius = 3.;
        float distanceToPlayer = easeInOutQuad(1. - clamp(length(globalPosition - playerPosition) / playerRadius, 0., 1.));
        float verticalDistanceToPlayer = easeOutQuad(1. - clamp((playerPosition.y - height) / 1.5, 0., 1.));
        vec3 offsetPosition = vec3(playerPosition.x, transform.y, playerPosition.z); 
        vec3 pushAway = inverse(mat3(modelMatrix)) * normalize(globalPosition - offsetPosition);
        
        transform += pushAway  
            * distanceToPlayer  
            * verticalDistanceToPlayer  
            * clamp((localPosition.y - .2) / (height * .85), 0., 1.)  
            * 1.; 

        transform.y = mix(transform.y, .5, distanceToPlayer * verticalDistanceToPlayer); 
        
        return transform;
    }
`

export default function GrassMaterial() {
    let { onBeforeCompile, uniforms } = useShader({
        name: "grass",
        uniforms: {
            ...makeLightUniforms("#fc03b1"),
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
 
            ${lightFragmentHead}

            ${dither}
            ${easings}
            ${noise}
            ${getGrassTransform} 
        `,
        vertex: {
            main: glsl`
                vGlobalPosition = (modelMatrix * vec4(position, 1.)).xyz;
                vPosition = transformed;

                transformed = getGrassTransform(position, vGlobalPosition, uPlayerPosition, modelMatrix);

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
                float heightScaler = 1. - clamp((vPosition.y) / height * .6, 0., 1.);   
                 
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    uFogColor, 
                    clamp(heightScaler + noiseEffect * (1. - heightScaler), 0., 1.) 
                );

                ${lightFragment}

                // engine light
                float engineDistance = easeInOutQuad(1. - clamp(length(vGlobalPosition - uPlayerPosition - vec3(0., 0., -1.5)) / 3., 0., 1.));
     
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    // purple => orange
                    mix(vec3(1.1, .0, 1.6), vec3(1.3, .9, 0.), engineDistance), 
                    engineDistance
                ); 

                // shadow player
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    gl_FragColor.rgb * .45,  
                    smoothstep(
                        .25, 
                        .75, 
                        clamp(1. - length((vGlobalPosition.xz - uPlayerPosition.xz) / vec2(.8, 2.5)) / 1.5, 0., 1.)
                    ) * step(.5, uPlayerPosition.y)
                ); 

                gl_FragColor.a = clamp((vPosition.y) / .5, 0., 1.);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 11., .0071);  
            `
        }
    })

    useLightsUpdater(uniforms)

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