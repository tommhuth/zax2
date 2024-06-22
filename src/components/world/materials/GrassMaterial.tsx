import { Color, DoubleSide, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import dither from "../../../shaders/dither.glsl"
import easings from "../../../shaders/easings.glsl"
import noise from "../../../shaders/noise.glsl"
import { useShader } from "../../../data/hooks"
import { grassColorEnd, grassColorStart } from "../../../data/theme"
import { glsl, ndelta } from "../../../data/utils"
import { store } from "../../../data/store"

export default function GrassMaterial() {
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: {
                value: 0,
            },
            uColorStart: {
                value: new Color(grassColorStart),
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
            uniform vec3 uColorEnd;
            varying vec3 vGlobalPosition;
            varying vec3 vPosition;
            uniform float uTime;

            ${dither}
            ${easings}
            ${noise}
        `,
        vertex: {
            main: glsl`
                vGlobalPosition = (modelMatrix * vec4(position, 1.)).xyz;
                vPosition = position;

                float height = 1.75;
                float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                float offsetSize = .4;
                float timeScale = 2.;
                vec3 playerPosition = vec3(uPlayerPosition.x, vGlobalPosition.y, uPlayerPosition.z); 
                vec3 offsetNormal = inverse(mat3(modelMatrix)) * normalize(vGlobalPosition - playerPosition);
                float playerRadius = 6.;
                float offsetEffect = 1. - clamp(length(playerPosition - vGlobalPosition) / playerRadius, 0., 1.);
                float offsetHeightEffect = 1. - clamp((uPlayerPosition.y - 1.) / (height * 2. - 1.), 0., 1.);

                transformed += offsetNormal 
                    * easeInCubic(offsetEffect * .75) 
                    * easeOutCubic(offsetHeightEffect) 
                    * clamp(position.y / height, 0., 1.) 
                    * 2.; 

                transformed.x += (cos((vGlobalPosition.x) * .1 + uTime * timeScale)) * heightScale * offsetSize;
                transformed.x += (sin((vGlobalPosition.z) * .6 + uTime * timeScale)) * heightScale * 1.5 * offsetSize; 
                transformed.x += (sin((vGlobalPosition.z) * .3 + uTime * timeScale)) * heightScale * .25 * offsetSize; 

                vGlobalPosition = (modelMatrix * vec4(transformed, 1.)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                float height = 2.25; 
                vec3 backlightColor = vec3(.5, .99, .2);  
                float playerDistanceEffect = 1. - clamp(
                    length(vGlobalPosition - vec3(uPlayerPosition.x, uPlayerPosition.y, uPlayerPosition.z - 3.)) / 5., 0., 1.
                );
                float noiseEffect = easeInOutSine((noise(vGlobalPosition * .15 + uTime * .4) + 1.) / 2.) ;

                // base color
                gl_FragColor.rgb = mix(uColorStart, uColorEnd, easeInQuad(clamp(vGlobalPosition.y / height, 0., 1.)));
             
                // tip highlight
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    mix(vec3(0., 1., 0.9), vec3(0., 1., 0.4), easeInOutCubic((noise(vGlobalPosition * .3 + uTime * .5) + 1.) / 2.)), // vec3(0.5, 1., 0.9),
                    clamp((vGlobalPosition.y - 1.75) / .5, 0., 1.)
                );
                
                // player highlight color
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    backlightColor,
                    playerDistanceEffect
                );

                // fog
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    vec3(0.0, 0.0, 0.3),
                    noiseEffect * easeInQuad(1. - clamp(vGlobalPosition.y / 5., 0., 1.))
                );

                gl_FragColor.a = clamp((vPosition.y) / .5, 0., 1.);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 11., .0025); 
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += ndelta(delta)
        uniforms.uTime.needsUpdate = true
        uniforms.uPlayerPosition.value.set(...store.getState().player.position.toArray())
        uniforms.uPlayerPosition.needsUpdate = true
    })

    return (
        <meshLambertMaterial
            side={DoubleSide}
            name="grass"
            transparent
            depthWrite={true}
            onBeforeCompile={onBeforeCompile}
        />
    )
}