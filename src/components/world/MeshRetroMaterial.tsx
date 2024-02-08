import { Color, MeshLambertMaterial, Vector3 } from "three"
import { useShader } from "../../data/hooks"
import { backColor as defaultBackColor, bcolor, fogColorStart, rightColor as defaultRightColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import ditherFragment from "../../shaders/dither.glsl"
import noise from "../../shaders/noise.glsl"
import { glsl } from "../../data/utils"
import { MeshLambertMaterialProps, useFrame } from "@react-three/fiber"
import { forwardRef } from "react"
import { useStore } from "../../data/store"

type MeshRetroMaterialProps = {
    isInstance?: boolean
    usesTime?: boolean
    usesPlayerPosition?: boolean
    fragmentShader?: string
    vertexShader?: string
    fogDensity?: number
    fogHeight?: number
    colorCount?: number
    dithering?: boolean

    rightColor?: string
    rightColorIntensity?: number
    backColor?: string
    backColorIntensity?: number
} & Omit<MeshLambertMaterialProps, "onBeforeCompile">

const MeshRetroMaterial = forwardRef<MeshLambertMaterial, MeshRetroMaterialProps>(({
    color = bcolor,
    isInstance = true,
    usesTime = false,
    usesPlayerPosition = false,
    fragmentShader = "",
    vertexShader = "",
    fogDensity = 0.0,
    fogHeight = 2.,
    colorCount = 9,
    dithering = true,
    rightColor = defaultRightColor,
    rightColorIntensity = .75,
    backColor = defaultBackColor,
    backColorIntensity = .5,
    emissive,
    ...rest
}, ref) => {
    let player = useStore(i => i.player.object)
    let { onBeforeCompile, uniforms, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uColorCount: { value: colorCount },
            uDither: { value: dithering ? 1 : 0 },
            uFogHeight: { value: fogHeight },
            uBasicDirectionLights: {
                value: [ 
                    {
                        direction: new Vector3(-1, 0, .85),
                        color: new Color(rightColor),
                        strength: rightColorIntensity,
                    },
                    {
                        direction: new Vector3(.4, 0, -1),
                        color: new Color(backColor),
                        strength: backColorIntensity,
                    },
                ]
            },
            uPlayerPosition: { value: new Vector3() },
            uFogDensity: { value: fogDensity },
            uFogColor: { value: new Color(fogColorStart) },
        },
        vertex: {
            head: glsl`
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 
                uniform vec3 uPlayerPosition; 
                varying vec3 vInstanceColor;    
                varying vec3 vNormal2;    

                ${easings}

                mat4 translationless(mat4 mat) {
                    mat4 m = mat4(mat);
                    m[3][0] = 0.;
                    m[3][1] = 0.;
                    m[3][2] = 0.;
                    return m;
                }
            `,
            main: glsl` 
                vec4 globalPosition = ${isInstance ? "instanceMatrix" : "modelMatrix"}  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz; 
                vNormal2 = (translationless(${isInstance ? "instanceMatrix" : "modelMatrix"}) * vec4(normal, 1.)).xyz;

                ${vertexShader}
            `
        },
        fragment: {
            head: glsl` 
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 
                uniform vec3 uFogColor;  
                uniform vec3 uPlayerPosition; 
                uniform float uDither;   
                uniform float uFogDensity;   
                uniform float uFogHeight;   
                uniform float uColorCount;   
                varying vec3 vInstanceColor;    
                varying vec3 vNormal2;    

                struct BasicDirectionLight {
                    vec3 direction;
                    vec3 color;
                    float strength;
                };
                uniform BasicDirectionLight uBasicDirectionLights[2];

                ${easings} 
                ${ditherFragment}
                ${noise}
            `,
            main: glsl`  
                for (int i = 0; i < uBasicDirectionLights.length(); i++) { 
                    BasicDirectionLight light = uBasicDirectionLights[i];

                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb,
                        mix(gl_FragColor.rgb, light.color, light.strength),
                        clamp(dot(normalize(vNormal2), light.direction), 0., 1.)
                    );
                }

                if (vGlobalPosition.y >= 0.) {
                    vec3 bottomColor = mix(uFogColor, gl_FragColor.rgb , 1. - uFogDensity); 
    
                    gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, easeOutQuad(clamp(vGlobalPosition.y / uFogHeight, .0, 1.))); 
                }
  
                ${fragmentShader}   

                if (uDither == 1.) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, uColorCount, .005);
                }  
            `
        }
    })

    useFrame((state, delta) => {
        if (usesTime) {
            uniforms.uTime.value += delta * .2
            uniforms.uTime.needsUpdate = true
        }

        if (usesPlayerPosition && player) {
            uniforms.uPlayerPosition.value = player.position.toArray()
            uniforms.uPlayerPosition.needsUpdate = true
        }
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