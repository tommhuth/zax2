import { DoubleSide, Mesh } from "three"
import { useStore } from "../../../../data/store"
import { groundFogIntensity, plantColor, plantColorEnd, plantColorStart } from "../../../../data/theme"
import { WorldPartType } from "../../../../data/types"
import { MeshRetroMaterial } from "../../MeshRetroMaterial"
import InstancedMesh from "../InstancedMesh"
import { glsl } from "../../../../data/utils"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export default function Plant() {
    let parts = useStore(i => i.world.parts)
    let ready = useStore(i => i.ready)
    let hasFoliage = ready ? parts.some(i => i.type === WorldPartType.BUILDINGS_LOW) : true
    let [plant] = useLoader(GLTFLoader, ["/models/plant.glb"])

    return ( 
        <InstancedMesh
            name="plant"
            count={16}
            receiveShadow={false}
            castShadow={true}
            visible={hasFoliage}
        >
            <primitive object={(plant.nodes.plant as Mesh).geometry} attach="geometry" />
            <MeshRetroMaterial
                usesTime
                usesPlayerPosition
                name="plant"
                colorCount={12}
                fogDensity={groundFogIntensity}
                color={plantColor}
                side={DoubleSide}
                vertexShader={glsl`
                    float height = 2.75;
                    float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
                    float offsetSize = .3;
                    float timeScale = 16.;

                    transformed.x += cos((globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
                    transformed.x += sin((globalPosition.x) * .4 + uTime * timeScale) * heightScale * offsetSize * 1.1;

                    transformed.z += cos((globalPosition.z) * .35 + uTime * timeScale) * heightScale * offsetSize;
                    transformed.z += sin((globalPosition.z) * .24 + uTime * timeScale) * heightScale * offsetSize * 1.15 ;

                    transformed.y += cos((globalPosition.y) * .35 + uTime * timeScale) * heightScale * offsetSize * .5;
                    transformed.y += cos((globalPosition.y) * .3 + uTime * timeScale) * heightScale * offsetSize * 1.25 * .5;  
                `}
                fragmentShader={glsl`
                    vec3 start = mix(gl_FragColor.rgb, vec3(${plantColorStart.toArray().map(i => i + .001).join(", ")}), .7);
                    vec3 end = mix(gl_FragColor.rgb, vec3(${plantColorEnd.toArray().map(i => i + .001).join(", ")}), .5);

                    gl_FragColor.rgb = mix(start, end, easeOutCubic(clamp(length(vPosition) / 5., 0., 1.))) * 1.25;
                `}
            />
        </InstancedMesh>
    )
}