import { Color, IUniform, MeshLambertMaterial, Vector3 } from "three"
import { backColor as defaultBackColor, bcolor, fogColor, rightColor as defaultRightColor, bulletColor, explosionColor } from "../../../data/theme"
import easings from "../../../shaders/easings.glsl"
import dithering from "../../../shaders/dither.glsl"
import noise from "../../../shaders/noise.glsl"
import utils from "../../../shaders/utils.glsl"
import { glsl } from "../../../data/utils"
import { ThreeElements, useFrame } from "@react-three/fiber"
import { forwardRef } from "react"
import { store, useStore } from "../../../data/store"
import { lightFragment, lightFragmentHead, makeLightUniforms, useLightsUpdater } from "./helpers"
import { ShaderPart, useShader } from "@data/lib/useShader"
import { OFFSCREEN } from "@data/const"

export type MeshRetroMaterialProps = {
    colorCount?: number
    dither?: number
    fog?: number
    rightColor?: string
    rightColorIntensity?: number
    backColor?: string
    backColorIntensity?: number
    additionalShadowStrength?: number
    shader?: {
        uniforms?: Record<string, IUniform>
        shared?: string
        vertex?: ShaderPart
        fragment?: ShaderPart
    }
} & Omit<ThreeElements["meshLambertMaterial"], "onBeforeCompile" | "dithering" | "fog">

const MeshRetroMaterial = forwardRef<MeshLambertMaterial, MeshRetroMaterialProps>(({
    color = bcolor,
    colorCount = 6,
    dither = .015,
    fog = .95,
    rightColor = defaultRightColor,
    rightColorIntensity = .75,
    backColor = defaultBackColor,
    backColorIntensity = 0,
    shader = {},
    emissive,
    additionalShadowStrength = .2,
    children,
    name,
    ...rest
}, ref) => {
    let player = useStore(i => i.player.object)
    let { onBeforeCompile, uniforms, customProgramCacheKey } = useShader({
        name,
        uniforms: {
            ...shader?.uniforms,
            ...makeLightUniforms(),
            uTime: { value: 0 },
            uFog: { value: fog },
            uColorCount: { value: colorCount },
            uDither: { value: dither },
            uAdditionalShadowStrength: {
                value: additionalShadowStrength,
            },
            uBasicDirectionLights: {
                value: [
                    {
                        direction: new Vector3(-1, 0, .75),
                        color: new Color(rightColor),
                        strength: rightColorIntensity,
                    },
                    {
                        direction: new Vector3(0, 0, -1),
                        color: new Color(backColor),
                        strength: backColorIntensity,
                    },
                ]
            },
            uPlayerPosition: { value: new Vector3() },
            uFogColor: { value: new Color(fogColor) },
            uBulletColor: { value: new Color(bulletColor) },
            uExplosionColor: { value: new Color(explosionColor) },
        },
        shared: glsl`  
            uniform float uTime; 
            uniform float uFog; 
            uniform vec3 uFogColor;  
            uniform vec3 uPlayerPosition; 
            uniform float uDither;    
            uniform float uColorCount;   
            uniform float uAdditionalShadowStrength;   
            varying vec3 vPosition;   
            varying vec3 vGlobalPosition;    
            varying vec3 vInstanceColor;    
            varying vec3 vGlobalNormal;    

            struct BasicDirectionLight {
                vec3 direction;
                vec3 color;
                float strength;
            };
            uniform BasicDirectionLight uBasicDirectionLights[2];

            ${lightFragmentHead}

            ${easings} 
            ${dithering}
            ${noise}
            ${utils}
            ${shader?.shared || ""}
        `,
        vertex: {
            head: shader?.vertex?.head,
            main: glsl`  
                #ifdef USE_INSTANCING
                    vec4 globalPosition = instanceMatrix * vec4(position, 1.);
                    vGlobalNormal = mat3(instanceMatrix) * normal;
	            #else 
                    vec4 globalPosition = modelMatrix * vec4(position, 1.);
                    vGlobalNormal = mat3(modelMatrix) * normal;
	            #endif  
 
                ${shader?.vertex?.main || ""}

                vGlobalNormal = normalize(vGlobalNormal);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz;  
            `
        },
        fragment: {
            head: shader?.fragment?.head,
            main: glsl`    
                for (int i = 0; i < uBasicDirectionLights.length(); i++) { 
                    BasicDirectionLight light = uBasicDirectionLights[i];

                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb,
                        mix(gl_FragColor.rgb, light.color, light.strength),
                        clamp(dot((vGlobalNormal), light.direction), 0., 1.)
                    );
                }   

                vec3 n1 = vGlobalPosition * .075 + uTime * 1.1;
              
                float noiseEffect = easeInOutSine((noise(n1) + 1.) / 2.) * .8;
                float heightScaler = 1. - clamp((vGlobalPosition.y) / 2., 0., 1.);  
                float heightMin = easeInQuad(1. - clamp((vGlobalPosition.y ) / .5, 0., 1.)) * .3; 

                // base fog
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    uFogColor, 
                    min(1., noiseEffect * heightScaler + heightMin) * uFog 
                );  

                // custom lights
                ${lightFragment} 
  
                ${shader?.fragment?.main || ""}

                getDirectionalLightInfo(directionalLights[0], directLight);

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb * .5, 
                    gl_FragColor.rgb,
                    getShadow( 
                        directionalShadowMap[0], 
                        directionalLightShadows[0].shadowMapSize, 
                        directionalLightShadows[0].shadowBias, 
                        directionalLightShadows[0].shadowRadius, 
                        vDirectionalShadowCoord[0] 
                    )
                );

                if (uDither > .0) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, uColorCount, uDither);
                }  
            `
        }
    })

    useFrame(() => {
        if (player) {
            let { health } = store.getState().player

            uniforms.uPlayerPosition.value.copy(health ? player.position : OFFSCREEN)
            uniforms.uPlayerPosition.needsUpdate = true
        }

        uniforms.uTime.value = store.getState().effects.time * .2
        uniforms.uTime.needsUpdate = true
    })

    useLightsUpdater(uniforms)

    return (
        <meshLambertMaterial
            onBeforeCompile={onBeforeCompile}
            color={color}
            emissive={emissive}
            ref={ref}
            customProgramCacheKey={customProgramCacheKey}
            {...rest}
        >
            {children}
        </meshLambertMaterial>
    )
})

export { MeshRetroMaterial } 