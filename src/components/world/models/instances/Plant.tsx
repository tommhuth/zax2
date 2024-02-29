import { DoubleSide, Mesh } from "three"
import { useStore } from "../../../../data/store"
import { plantColor } from "../../../../data/theme"
import { WorldPartType } from "../../../../data/types"
import { MeshRetroMaterial } from "../../materials/MeshRetroMaterial"
import InstancedMesh from "../InstancedMesh"
import { glsl } from "../../../../data/utils"
import { useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useMemo } from "react"
import easings from "../../../../shaders/easings.glsl"
import noise from "../../../../shaders/noise.glsl"

export default function Plant() {
    let count = 10
    let parts = useStore(i => i.world.parts)
    let ready = useStore(i => i.ready)
    let hasFoliage = ready ? parts.some(i => i.type === WorldPartType.BUILDINGS_LOW) : true
    let [plant] = useLoader(GLTFLoader, ["/models/plant.glb"])
    let traumaData = useMemo(() => new Float32Array(count).fill(0), [])
    let uniforms = useMemo(() => ({ uTime: { value: 0, needsUpdate: true }}), [])
    let vertexShader = glsl`
        float height = 2.75;
        float heightScale = easeInQuad(clamp(position.y / height, 0., 1.));
        float offsetSize = .3;
        float timeScale = 16.;

        transformed.x += cos((globalPosition.x) * .5 + uTime * timeScale) * heightScale * offsetSize;
        transformed.x += sin((globalPosition.x) * .4 + uTime * timeScale) * heightScale * offsetSize * 1.1;

        transformed.z += cos((globalPosition.z) * .35 + uTime * timeScale * .1) * heightScale * offsetSize;
        transformed.z += sin((globalPosition.z) * .24 + uTime * timeScale * .1) * heightScale * offsetSize * 1.15 ;

        transformed.y += cos((globalPosition.y) * .35 + uTime * timeScale * .2) * heightScale * offsetSize * .5;
        transformed.y += cos((globalPosition.y) * .3 + uTime * timeScale * .2) * heightScale * offsetSize * 1.25 * .5;  

        transformed += aTrauma * random(globalPosition.xz + uTime) * normalize(transformed);
    `

    useFrame((state, delta)=> {
        uniforms.uTime.value += delta * .2 
        uniforms.uTime.needsUpdate = true
    })

    return ( 
        <InstancedMesh
            name="plant"
            count={count}
            receiveShadow
            castShadow
            visible={hasFoliage}
        >
            <primitive 
                object={(plant.nodes.plant as Mesh).geometry} 
                attach="geometry" 
            >
                <instancedBufferAttribute 
                    attach={"attributes-aTrauma"} 
                    args={[traumaData, 1, false, 1]}
                />
            </primitive>

            <meshDepthMaterial
                attach="customDepthMaterial"
                onBeforeCompile={(shader) => {
                    shader.uniforms = {
                        ...shader.uniforms,
                        ...uniforms
                    }

                    const chunk = glsl`
                        #include <begin_vertex> 

                        vec3 globalPosition = (instanceMatrix * vec4(position, 1.)).xyz;
                        ${vertexShader}
                    ` 

                    shader.vertexShader = glsl` 
                        uniform float uTime; 
                        attribute float aTrauma;

                        ${easings}
                        ${noise} 
                        ${shader.vertexShader}
                    `.replace("#include <begin_vertex>", chunk)
                }} 
            />
            
            <MeshRetroMaterial 
                name="plant"
                colorCount={12}
                vertexColors
                color={plantColor}
                side={DoubleSide}
                shader={{
                    vertex: {
                        head: glsl` 
                            attribute float aTrauma;
                        `, 
                        main: glsl`
                            ${vertexShader}
                        `
                    }
                }} 
            />
        </InstancedMesh>
    )
}