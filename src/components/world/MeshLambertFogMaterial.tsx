import { Color, ColorRepresentation, MeshLambertMaterial, MeshPhongMaterial, Vector3 } from "three"
import { useShader } from "../../data/hooks"
import { backColor, bcolor, fogColorStart, leftColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import ditherFragment from "../../shaders/dither.glsl"
import { glsl } from "../../data/utils"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { useStore } from "../../data/store"

interface MeshLambertFogMaterialProps {
    color?: ColorRepresentation
    emissive?: ColorRepresentation
    isInstance?: boolean
    usesTime?: boolean
    usesPlayerPosition?: boolean
    fragmentShader?: string
    vertexShader?: string
    fogDensity?: number
    dither?: boolean
}

export function MeshLambertFogMaterial({
    color = bcolor,
    isInstance = true,
    usesTime = false,
    usesPlayerPosition = true,
    fragmentShader = "",
    vertexShader = "",
    fogDensity = 0.0,
    dither = true,
    emissive,
    ...rest
}: MeshLambertFogMaterialProps & Partial<Omit<MeshPhongMaterial, "color" | "emissive" | "onBeforeCompile">>) {
    let ref = useRef<MeshLambertMaterial>(null)
    let player = useStore(i => i.player.object)
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uDither: { value: dither ? 1 : 0 },
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
 
                float heightDistance = 1.5;
                vec3 bottomColor = mix(uFogColor, gl_FragColor.rgb , 1. - uFogDensity); 

                gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, (clamp(vGlobalPosition.y / heightDistance, .0, 1.))); 
         
                if (uDither == 1.) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 16., .005);
                } 
            `
        }
    })


    useEffect(() => {
        if (ref.current) {
            ref.current.needsUpdate = true
        }
    }, [])

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
        <meshPhongMaterial
            onBeforeCompile={onBeforeCompile}
            color={color}
            attach={"material"}
            emissive={emissive}
            {...rest}
        />
    )
} 