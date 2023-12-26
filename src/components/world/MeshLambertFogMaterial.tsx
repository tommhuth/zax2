import { Color, MeshLambertMaterial, TextureLoader, Vector3 } from "three"
import { useShader } from "../../data/hooks"
import { backColor, bcolor, fogColorEnd, fogColorStart, leftColor, topColor } from "../../data/theme"
import easings from "../../shaders/easings.glsl"
import dither from "../../shaders/dither.glsl"
import { glsl } from "../../data/utils"
import { useFrame, useLoader } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { useStore } from "../../data/store"
import Counter from "../../data/world/Counter"

export function MeshLambertFogMaterial({
    color = bcolor,
    isInstance = true,
    usesTime = false,
    usesPlayerPosition = true,
    fragmentShader = "",
    vertexShader = "",
    fogDensity = 0.2,
    ditherActive = true,
    ...rest
}) {
    let counter = useMemo(() => new Counter(1), [])
    let ref = useRef<MeshLambertMaterial>(null) 
    let player = useStore(i => i.player.object)
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uDitherActive: { value: ditherActive ? 1 : 0 },
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
            uExplosions: {
                value: [
                    {
                        position: new Vector3(0, 0, 0),
                        strength: 0,
                        radius: 21,
                    },
                    {
                        position: new Vector3(0, 0, 26),
                        strength: 0,
                        radius: 1,
                    },
                    {
                        position: new Vector3(0, 0, 35),
                        strength: 0,
                        radius: 1,
                    }
                ],
            },
            uPlayerPosition: { value: new Vector3() },
            uFogColorStart: { value: new Color(fogColorStart) },
            uFogColorEnd: { value: new Color(fogColorEnd) },
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
                uniform vec3 uFogColorStart; 
                uniform vec3 uFogColorEnd;  
                uniform vec3 uPlayerPosition; 
                uniform float uDitherActive; 

                struct Explosion {
                    vec3 position;
                    float strength;
                    float radius;
                };


                struct BasicDirectionLight {
                    vec3 direction;
                    vec3 color;
                    float strength;
                };
                
                uniform Explosion uExplosions[3];
                uniform BasicDirectionLight uBasicDirectionLights[2];


                ${easings}
                ${dither}
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
 
                float fogDensity = ${fogDensity};
                float heightDistance = 2.;
                vec3 bottomColor = mix(uFogColorStart, gl_FragColor.rgb , 1. - fogDensity); 

                gl_FragColor.rgb = mix(bottomColor, gl_FragColor.rgb, easeOutCubic(clamp(vGlobalPosition.y / heightDistance, .0, 1.)));

                if (uDitherActive == 1.) { 
                    gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 16., .0051);
                }

                /*
                float shadowEffect = 1.; 

                for (int j = 0; j < uExplosions.length(); ++j) {
                    Explosion explosion = uExplosions[j];
                     
                    shadowEffect = min( 
                        shadowEffect,
                        explosion.strength * easeInOutCubic(
                            clamp(length(vGlobalPosition - explosion.position) / explosion.radius, 0., 1.)
                        )
                    );
                }

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    vec3(.0, .0, .0), 
                    shadowEffect
                ); 
                */
            `
        }
    })
    let explosions = useStore(i => i.effects.explosions)

    useEffect(() => {
        if (!explosions.length) {
            return
        }

        uniforms.uExplosions.value[counter.current + 1].position = explosions[0].position
        uniforms.uExplosions.value[counter.current + 1].strength = 1
        uniforms.uExplosions.value[counter.current + 1].radius = explosions[0].radius * 2
        uniforms.uExplosions.needsUpdate = true
        counter.next()
    }, [explosions, uniforms])

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

        //uniforms.uExplosions.value[0].position =  player.position.toArray()
        if (player) {
            uniforms.uExplosions.value[0].position = player.position.toArray()
        }

        for (let i = 0; i < 2; i++) {
            uniforms.uExplosions.value[i + 1].strength *= .95
        }

        uniforms.uExplosions.needsUpdate = true

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
            dithering
            ref={ref}
            {...rest}
        />
    )
}


useLoader.preload(TextureLoader, "/textures/night-2-4K.jpg")