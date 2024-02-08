import { DoubleSide, Mesh } from "three"
import { useStore } from "../../../../data/store"
import { grassColor, grassColorEnd, grassColorStart } from "../../../../data/theme"
import { WorldPartType } from "../../../../data/types"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"
import InstancedMesh from "../InstancedMesh"
import { glsl } from "../../../../data/utils"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export default function Grass() {
    let parts = useStore(i => i.world.parts)
    let ready = useStore(i => i.ready)
    let hasFoliage = ready ? parts.some(i => i.type === WorldPartType.BUILDINGS_LOW) : true
    let [grass] = useLoader(GLTFLoader, ["/models/grass.glb"])

    return ( 
        <InstancedMesh
            castShadow={false}
            receiveShadow={false}
            colors={false}
            name="grass"
            visible={hasFoliage}
            count={14}
        >
            <primitive object={(grass.nodes.grass as Mesh).geometry} attach="geometry" />
            <MeshRetroMaterial
                usesTime
                color={grassColor}
                side={DoubleSide}
                usesPlayerPosition
                fogDensity={0}
                name="grass"
                dithering={false}
                transparent
                backColorIntensity={0}
                rightColorIntensity={0}
                vertexShader={glsl`
                    float height = 1.75;
                    float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                    float offsetSize = .4;
                    float timeScale = 8.;
                    vec3 playerPosition = vec3(uPlayerPosition.x, vGlobalPosition.y, uPlayerPosition.z);
                    //vec3 offsetNormal = (vec4(normalize(vGlobalPosition - playerPosition), 1.) * removeTranslation(instanceMatrix)).xyz;
                    vec3 offsetNormal = normalize(vGlobalPosition - playerPosition);
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
                    vec3 start = mix(gl_FragColor.rgb, vec3(${grassColorStart.toArray().map(i => i + .001).join(", ")}), .2);
                    vec3 end = mix(gl_FragColor.rgb, vec3(${grassColorEnd.toArray().map(i => i + .001).join(", ")}), .8);
                    vec3 cameraDirection = normalize(vec3(-57.2372, 50., -61.237));
                    vec3 lightPosition = vec3(uPlayerPosition.xy, uPlayerPosition.z - .5);
                    vec3 backlightColor =  vec3(.2, 1.0, .2);
                    // dot(normalize(lightPosition - vGlobalPosition ), normal), 0., 1.) *

                    gl_FragColor.rgb = mix(start, end, easeInQuad(clamp(vGlobalPosition.y / height, 0., 1.)));
                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb, 
                        mix(gl_FragColor.rgb, backlightColor, .7), 
                        clamp(1. - (length(lightPosition - vGlobalPosition) / 10.), 0., 1.)
                    );
                    gl_FragColor.a = clamp((vPosition.y) / .75, 0., 1.);
                `}
            />
        </InstancedMesh>

    )
}