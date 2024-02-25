import { Color, DoubleSide, Mesh, Vector3 } from "three"
import { store, useStore } from "../../../../data/store"
import { grassColorEnd, grassColorStart } from "../../../../data/theme"
import { WorldPartType } from "../../../../data/types" 
import InstancedMesh from "../InstancedMesh"
import { glsl } from "../../../../data/utils"
import { useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useShader } from "../../../../data/hooks"
import dither from "../../../../shaders/dither.glsl"
import easings from "../../../../shaders/easings.glsl"
import noise from "../../../../shaders/noise.glsl"

export default function Grass() {
    let parts = useStore(i => i.world.parts)
    let ready = useStore(i => i.ready)
    let hasFoliage = ready ? parts.some(i => i.type === WorldPartType.BUILDINGS_LOW) : true
    let [grass] = useLoader(GLTFLoader, ["/models/grass.glb"])
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
                vGlobalPosition = (instanceMatrix * vec4(position, 1.)).xyz;
                vPosition = position;

                float height = 1.75;
                float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                float offsetSize = .4;
                float timeScale = 2.;
                vec3 playerPosition = vec3(uPlayerPosition.x, vGlobalPosition.y, uPlayerPosition.z); 
                vec3 offsetNormal = inverse(mat3(instanceMatrix)) * normalize(vGlobalPosition - playerPosition);
                float playerRadius = 6.;
                float offsetEffect = 1. - clamp(length(playerPosition - vGlobalPosition) / playerRadius, 0., 1.);
                float offsetHeightEffect = 1. - clamp((uPlayerPosition.y - 1.) / (height * 2. - 1.), 0., 1.);

                transformed += offsetNormal 
                    * easeInCubic(offsetEffect) 
                    * easeOutCubic(offsetHeightEffect) 
                    * clamp(position.y / height, 0., 1.) 
                    * 2.; 

                transformed.x += (cos((vGlobalPosition.x) * .1 + uTime * timeScale)) * heightScale * offsetSize;
                transformed.x += (sin((vGlobalPosition.z) * .6 + uTime * timeScale)) * heightScale * 1.5 * offsetSize; 
                transformed.x += (sin((vGlobalPosition.z) * .3 + uTime * timeScale)) * heightScale * .25 * offsetSize; 
            `
        },
        fragment: {
            main: glsl` 
                float height = 2.25; 
                vec3 backlightColor = vec3(.8, .99, .0);  
                float playerDistanceEffect = 1. - clamp(
                    length(vGlobalPosition - vec3(uPlayerPosition.x, uPlayerPosition.y, uPlayerPosition.z - 3.)) / 5., 0., 1.
                );
                float noiseEffect = easeInOutSine((noise(vGlobalPosition * .15 + uTime * .4) + 1.) / 2.) ;

                // base color
                gl_FragColor.rgb = mix(uColorStart, uColorEnd, easeInQuad(clamp(vGlobalPosition.y / height, 0., 1.)));
                // player highlight color
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    backlightColor,
                    playerDistanceEffect
                );
                // tip highlight
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    vec3(0.5, 1., 0.9),
                    clamp((vGlobalPosition.y - 1.75) / .8, 0., 1.)
                );
                // fog
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    vec3(0.0, 0.0, 0.3),
                    noiseEffect * easeInQuad(1. - clamp(vGlobalPosition.y / 5., 0., 1.))
                );

                gl_FragColor.a = clamp((vPosition.y) / .5, 0., 1.);
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 8., .0091); 
            `
        }
    })

    useFrame((state, delta)=> {
        uniforms.uTime.value +=  delta 
        uniforms.uTime.needsUpdate = true
        uniforms.uPlayerPosition.value.set(...store.getState().player.position.toArray())
        uniforms.uPlayerPosition.needsUpdate = true 
    })

    return ( 
        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            colors={false}
            name="grass"
            visible={hasFoliage}
            count={6}
        >
            <primitive object={(grass.nodes.grass as Mesh).geometry} attach="geometry" />
            <meshLambertMaterial  
                side={DoubleSide}  
                name="grass" 
                transparent 
                onBeforeCompile={onBeforeCompile}
            />
        </InstancedMesh>

    )
}
/*


                vertexShader={glsl`
                    float height = 1.75;
                    float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                    float offsetSize = .4;
                    float timeScale = 8.;
                    vec3 playerPosition = vec3(uPlayerPosition.x, vGlobalPosition.y, uPlayerPosition.z); 
                    vec3 offsetNormal = inverse(mat3(instanceMatrix)) * normalize(vGlobalPosition - playerPosition);
                    float playerRadius = 6.;
                    float offsetEffect = 1. - clamp(length(playerPosition - vGlobalPosition) / playerRadius, 0., 1.);
                    float offsetHeightEffect = 1. - clamp((uPlayerPosition.y - 1.) / (height * 2. - 1.), 0., 1.);

                    transformed += offsetNormal 
                        * easeInCubic(offsetEffect) 
                        * easeOutCubic(offsetHeightEffect) 
                        * clamp(position.y / height, 0., 1.) 
                        * 2.; 

                    transformed.x += cos((globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                    transformed.x += cos((globalPosition.z) * .4 + uTime * timeScale) * heightScale * 1.1 * offsetSize; 
                `}
                fragmentShader={glsl`
                    float height = 2.25;
                    vec3 start = mix(gl_FragColor.rgb, vec3(${grassColorStart.toArray().map(i => i + .001).join(", ")}), .0);
                    vec3 end = mix(gl_FragColor.rgb, vec3(${grassColorEnd.toArray().map(i => i + .001).join(", ")}), .0);
                    vec3 pp = vec3(uPlayerPosition);

                    pp.z -= 3.5;
 
                    vec3 backlightColor = vec3(.99, .99, .0);  
                    float dist = 1. - clamp(length(vGlobalPosition - pp) / 5., 0., 1.);
 
                    gl_FragColor.rgb = mix(start, end, easeInQuad(clamp(vGlobalPosition.y / height, 0., 1.)));
                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb,
                        backlightColor,
                        dist
                    );
 
                    gl_FragColor.a = clamp((vPosition.y) / .5, 0., 1.); 
                `}
            />
            */