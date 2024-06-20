import { Color, MeshLambertMaterial, Vector3 } from "three"
import { UseShaderParams, useShader } from "../../../data/hooks"
import { backColor as defaultBackColor, bcolor, fogColor, rightColor as defaultRightColor } from "../../../data/theme"
import easings from "../../../shaders/easings.glsl"
import dithering from "../../../shaders/dither.glsl"
import noise from "../../../shaders/noise.glsl"
import utils from "../../../shaders/utils.glsl"
import { glsl, ndelta } from "../../../data/utils"
import { MeshLambertMaterialProps, useFrame } from "@react-three/fiber"
import { forwardRef, useEffect, useMemo } from "react"
import { store, useStore } from "../../../data/store"
import Counter from "../../../data/Counter"

const lightSourceCount = 4

type MeshRetroMaterialProps = {
    colorCount?: number
    dither?: number
    rightColor?: string
    rightColorIntensity?: number
    backColor?: string
    backColorIntensity?: number
    additionalShadowStrength?: number
    shader?: {
        uniforms?: UseShaderParams["uniforms"]
        shared?: UseShaderParams["shared"]
        vertex?: UseShaderParams["vertex"]
        fragment?: UseShaderParams["fragment"]
    }
} & Omit<MeshLambertMaterialProps, "onBeforeCompile" | "dithering">

const MeshRetroMaterial = forwardRef<MeshLambertMaterial, MeshRetroMaterialProps>(({
    color = bcolor,
    colorCount = 6,
    dither = .015,
    rightColor = defaultRightColor,
    rightColorIntensity = .75,
    backColor = defaultBackColor,
    backColorIntensity = 0,
    shader = {},
    emissive,
    additionalShadowStrength = .15,
    children,
    ...rest
}, ref) => {
    let player = useStore(i => i.player.object)
    let lightSourceCounter = useMemo(() => new Counter(lightSourceCount - 1), [])
    let { onBeforeCompile, uniforms, customProgramCacheKey } = useShader({
        uniforms: {
            ...shader?.uniforms,
            uTime: { value: 0 },
            uColorCount: { value: colorCount },
            uDither: { value: dither },
            uLightSources: {
                value: new Array(lightSourceCount).fill(null).map(() => {
                    return {
                        position: new Vector3(),
                        strength: 0,
                        radius: 0,
                    }
                })
            },
            uBulletLights: {
                value: new Array(20).fill(null).map(() => {
                    return {
                        position: new Vector3(),
                        radius: 0,
                    }
                })
            },
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
        },
        shared: glsl`  
            uniform float uTime; 
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

            struct LightSource {
                vec3 position; 
                float strength;
                float radius;
            };
            uniform LightSource uLightSources[${lightSourceCount}];


            struct BulletLight {
                vec3 position;  
                float radius;
            };
            uniform BulletLight uBulletLights[20];

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

                vec3 baseFogColor = vec3(0.0, 0.0, 0.3);
                vec3 highlightColor = vec3(1., 0.75, 0.01) * 1.3;
                float fogLightEffect = 0.;
 
                for (int i = 0; i < uLightSources.length(); i++) { 
                    LightSource light = uLightSources[i];

                    float currentLightEffect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.)) 
                        * light.strength;

                    fogLightEffect = max(fogLightEffect, currentLightEffect);
                }  

                float bulletLightEffect = 0.;

                for (int i = 0; i < uBulletLights.length(); i++) { 
                    BulletLight light = uBulletLights[i];

                    float currentLightEffect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.));

                    bulletLightEffect = max(bulletLightEffect, currentLightEffect);
                } 

                float noiseEffect = easeInOutSine((noise(vGlobalPosition * .1 + uTime * 1.4) + 1.) / 2.) * .8;
                float heightScaler = 1. - clamp((vGlobalPosition.y) / 2., 0., 1.);  
                float heightMin = easeInQuad(1. - clamp((vGlobalPosition.y ) / .5, 0., 1.)) * .3; 

                // base fog
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    baseFogColor, 
                    min(1., noiseEffect * heightScaler + heightMin) 
                );  

                // bullet light
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    mix(gl_FragColor.rgb, vec3(.6, 1., 1.), .5),
                    easeInSine(bulletLightEffect)
                );  

                // light highlights
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    highlightColor,
                    easeInOutCubic(fogLightEffect)
                );
  
                ${shader?.fragment?.main || ""}

                getDirectionalLightInfo(directionalLights[0], directLight);

                gl_FragColor.rgb -= (1. - getShadow( 
                    directionalShadowMap[0], 
                    directionalLightShadows[0].shadowMapSize, 
                    directionalLightShadows[0].shadowBias, 
                    directionalLightShadows[0].shadowRadius, 
                    vDirectionalShadowCoord[0] 
                )) * uAdditionalShadowStrength * clamp(dot(-vGlobalNormal, vec3(0., -1., 0.)), 0., 1.);


                if (uDither > .0) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, uColorCount, uDither);
                }  
            `
        }
    })

    useFrame(() => {
        let bullets = store.getState().world.bullets

        for (let i = 0; i < 20; i++) {
            uniforms.uBulletLights.value[i].radius = 0
        }

        for (let i = 0; i < 20; i++) {
            let bullet = bullets[i]

            if (bullet) {
                uniforms.uBulletLights.value[bullet.lightIndex].position.copy(bullet.position)
                uniforms.uBulletLights.value[bullet.lightIndex].radius = 5
            }
        }

        uniforms.uBulletLights.needsUpdate = true
    })

    useEffect(() => {
        return useStore.subscribe(
            state => state.effects.explosions[0],
            (lastExplosion) => {
                if (!lastExplosion) {
                    return
                }

                uniforms.uLightSources.value[lightSourceCounter.current].strength = 1
                uniforms.uLightSources.value[lightSourceCounter.current].radius = lastExplosion.radius * 1.6
                uniforms.uLightSources.value[lightSourceCounter.current].position.set(...lastExplosion.position)

                lightSourceCounter.next()
            }
        )
    }, [])

    useFrame((state, delta) => {
        if (player) {
            uniforms.uPlayerPosition.value = player.position.toArray()
            uniforms.uPlayerPosition.needsUpdate = true
        }

        uniforms.uTime.value += ndelta(delta) * .2
        uniforms.uTime.needsUpdate = true

        for (let i = 0; i < uniforms.uLightSources.value.length; i++) {
            uniforms.uLightSources.value[i].strength *= .97
        }

        uniforms.uLightSources.needsUpdate = true
    })

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