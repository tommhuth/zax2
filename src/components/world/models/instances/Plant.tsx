import { DoubleSide, RGBADepthPacking } from "three"
import { plantColor } from "../../../../data/theme"
import { MeshRetroMaterial } from "../../materials/MeshRetroMaterial"
import InstancedMesh from "../InstancedMesh"
import { glsl } from "../../../../data/utils"
import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import easings from "../../../../shaders/easings.glsl"
import noise from "../../../../shaders/noise.glsl"
import model from "@assets/models/plant.glb"
import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"

export default function Plant() {
    let count = 10
    let { nodes } = useGLTF(model) as GLTFModel<["plant"]>
    let traumaData = useMemo(() => new Float32Array(count).fill(0), [])
    let uniforms = useMemo(() => ({ uTime: { value: 0, needsUpdate: true } }), [])
    let getPlantTransform = glsl`
        vec3 getPlantTransform(vec3 localPosition, vec3 globalPosition) {
            vec3 result = vec3(0.);
            float height = 2.75;
            float offsetSize = .3;
            float offsetScale = offsetSize 
                * clamp(localPosition.y / height, 0., 1.) 
                * clamp(length(localPosition) / 3. - .2, 0., 1.);
            float time = uTime * 16.; 
    
            result.x += cos(globalPosition.x * .5 + time) * offsetScale;
            result.x += sin(globalPosition.x * .4 + time) * offsetScale * 1.1;
    
            result.y += cos(globalPosition.y * .35 + time) * offsetScale * .6;
            result.y += sin(globalPosition.y * .2 + time * .5) * offsetScale * .25;  
    
            result.z += cos(globalPosition.z * .35 + time * .1) * offsetScale;
            result.z += sin(globalPosition.z * .24 + time * .1) * offsetScale * 1.15;
    
            result += random(globalPosition.xz + uTime) * normalize(localPosition) * aTrauma;

            return result;
        }
    `

    useFrame((state, delta) => {
        uniforms.uTime.value += delta * .2
        uniforms.uTime.needsUpdate = true
    })

    return (
        <InstancedMesh
            name="plant"
            count={count}
            receiveShadow
            castShadow
        >
            <primitive
                object={nodes.plant.geometry}
                attach="geometry"
            >
                <instancedBufferAttribute
                    attach={"attributes-aTrauma"}
                    args={[traumaData, 1, false, 1]}
                />
            </primitive>

            <meshDepthMaterial
                attach="customDepthMaterial"
                depthPacking={RGBADepthPacking}
                alphaTest={.5}
                onBeforeCompile={(shader) => {
                    shader.uniforms = {
                        ...shader.uniforms,
                        ...uniforms
                    }

                    shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
                        #include <common>
                        
                        uniform float uTime; 
                        attribute float aTrauma;

                        ${easings}
                        ${noise}  
                        ${getPlantTransform}
                    `)
                    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
                        #include <begin_vertex>

                        vec3 globalPosition = (instanceMatrix * vec4(position, 1.)).xyz; 

                        transformed += getPlantTransform(position, globalPosition);
                    `)
                }}
            />

            <MeshRetroMaterial
                name="plant"
                colorCount={7}
                vertexColors
                color={plantColor}
                side={DoubleSide}
                rightColorIntensity={.5}
                rightColor="#ff0"
                dither={.015}
                shader={{
                    vertex: {
                        head: glsl` 
                            attribute float aTrauma;
                            ${getPlantTransform}
                        `,
                        main: glsl`
                            transformed += getPlantTransform(position, globalPosition.xyz);
                        `
                    }
                }}
            />
        </InstancedMesh>
    )
}