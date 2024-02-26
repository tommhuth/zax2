import { Color, MeshLambertMaterial, Vector3 } from "three"
import { useShader } from "../../data/hooks"
import { backColor as defaultBackColor, bcolor, fogColor, rightColor as defaultRightColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import dithering from "../../shaders/dither.glsl"
import noise from "../../shaders/noise.glsl"
import { glsl } from "../../data/utils"
import { MeshLambertMaterialProps, useFrame } from "@react-three/fiber"
import { forwardRef, useEffect } from "react"
import { useStore } from "../../data/store"
import Counter from "../../data/world/Counter"

type MeshRetroMaterialProps = {  
    fragmentShader?: string
    vertexShader?: string 
    colorCount?: number
    dither?: number 
    rightColor?: string
    rightColorIntensity?: number
    backColor?: string
    backColorIntensity?: number
} & Omit<MeshLambertMaterialProps, "onBeforeCompile" | "dithering">

let counter = new Counter(1)

const MeshRetroMaterial = forwardRef<MeshLambertMaterial, MeshRetroMaterialProps>(({
    color = bcolor,  
    fragmentShader = "",
    vertexShader = "", 
    colorCount = 11,
    dither = .005,
    rightColor = defaultRightColor,
    rightColorIntensity = .75,
    backColor = defaultBackColor,
    backColorIntensity = 0,
    emissive,
    ...rest
}, ref) => {
    let player = useStore(i => i.player.object) 
    let { onBeforeCompile, uniforms, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uColorCount: { value: colorCount },
            uDither: { value: dither }, 
            uLightSources: {
                value: [ 
                    {
                        position: new Vector3(), 
                        strength: 0,
                        radius: 0,
                    },
                    {
                        position: new Vector3(), 
                        strength: 0,
                        radius: 0,
                    },
                ]
            },
            uBasicDirectionLights: {
                value: [ 
                    {
                        direction: new Vector3(-1,0, .75),
                        color: new Color(rightColor),
                        strength: rightColorIntensity,
                    },
                    {
                        direction: new Vector3(0,0, -1),
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
            uniform LightSource uLightSources[2];

            ${easings} 
            ${dithering}
            ${noise}
        
        `,
        vertex: { 
            main: glsl`  
                #ifdef USE_INSTANCING
                    vec4 globalPosition = instanceMatrix * vec4(position, 1.);
                    vGlobalNormal = mat3(instanceMatrix) * normal;
	            #else 
                    vec4 globalPosition = modelMatrix * vec4(position, 1.);
                    vGlobalNormal = mat3(modelMatrix) *  normal;
	            #endif 

                vGlobalNormal = normalize(vGlobalNormal);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz;  

                ${vertexShader}
            `
        },
        fragment: { 
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
                vec3 fogColorHi = vec3(0.3, 0.3, 0.99);
                float fogLightEffect = 1. - clamp(length(uPlayerPosition - vGlobalPosition) / 8.5, 0., 1.);

                for (int i = 0; i < uLightSources.length(); i++) { 
                    LightSource light = uLightSources[i];

                    float effect = (1. - clamp(length(light.position - vGlobalPosition) / light.radius, 0., 1.)) * light.strength;

                    fogLightEffect = max(fogLightEffect, effect);
                } 

                float noiseEffect = easeInOutSine((noise(vGlobalPosition * .1 + uTime * 1.4) + 1.) / 2.) * .8;
                float heightScaler = 1. - clamp((vGlobalPosition.y) / 2., 0., 1.);
                float lowHeight = 1. - clamp(abs(vGlobalPosition.y) / 2., 0., 1.);
                float heightMin = easeInQuad(1. - clamp((vGlobalPosition.y ) / .5, 0., 1.)); 
                float heightBase = .45;
                
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    mix(baseFogColor, fogColorHi, easeInQuad(fogLightEffect)), 
                    min(1., (noiseEffect * heightScaler + heightMin * heightBase) * lowHeight) 
                ); 

                if (uDither > .0) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, uColorCount, uDither);
                }  
  
                ${fragmentShader}  
            `
        }
    })

    useEffect(() => {
        return useStore.subscribe(
            state => state.effects.explosions[0],
            (lastExplosion) => {
                if (!lastExplosion) {
                    return 
                }
        
                let i = counter.current
         
                uniforms.uLightSources.value[i].strength = 1
                uniforms.uLightSources.value[i].radius = lastExplosion.radius * 2
                uniforms.uLightSources.value[i].position.set(...lastExplosion.position)
        
                counter.next()
            }
        )
    }, []) 

    useFrame((state, delta) => { 
        if (player) {
            uniforms.uPlayerPosition.value = player.position.toArray()
            uniforms.uPlayerPosition.needsUpdate = true
        }

        uniforms.uTime.value += delta * .2
        uniforms.uTime.needsUpdate = true

        uniforms.uLightSources.value[0].strength *= .97
        uniforms.uLightSources.value[1].strength *= .97
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
        />
    )
})

export { MeshRetroMaterial }