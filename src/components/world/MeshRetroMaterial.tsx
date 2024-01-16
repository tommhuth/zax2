import { Color, MeshLambertMaterial, Vector3 } from "three"
import { useShader } from "../../data/hooks"
import { backColor, bcolor, fogColorStart, leftColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import ditherFragment from "../../shaders/dither.glsl"
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
    emissive,
    ...rest
}, ref) => {
    let player = useStore(i => i.player.object)
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uColorCount: { value: colorCount },
            uDither: { value: dithering ? 1 : 0 },
            uFogHeight: { value: fogHeight },
            uBasicDirectionLights: {
                value: [
                    {
                        direction: new Vector3(0, 0, -1),
                        color: new Color(backColor),
                        strength: .5,
                    },
                    {
                        direction: new Vector3(1, 0, 0),
                        color: new Color(leftColor),
                        strength: .75,
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

                ${easings}
            `,
            main: glsl` 
                vec4 globalPosition = ${isInstance ? "instanceMatrix" : "modelMatrix"}  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz;

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

                struct BasicDirectionLight {
                    vec3 direction;
                    vec3 color;
                    float strength;
                };
                uniform BasicDirectionLight uBasicDirectionLights[2];

                ${easings} 
                ${ditherFragment}
            `,
            main: glsl` 
                ${fragmentShader}  

                for (int i = 0; i < uBasicDirectionLights.length(); ++i) { 
                    BasicDirectionLight light = uBasicDirectionLights[i];

                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb,
                        mix(gl_FragColor.rgb, light.color, light.strength),
                        clamp(dot(normal, light.direction), 0., 1.)
                    );
                }
  
                vec3 bottomColor = mix(uFogColor, gl_FragColor.rgb , 1. - uFogDensity); 

                gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, easeOutQuad(clamp(vGlobalPosition.y / uFogHeight, .0, 1.))); 
         
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
            {...rest}
        />
    )
})

export { MeshRetroMaterial }