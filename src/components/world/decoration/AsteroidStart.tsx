import { useGLTF } from "@react-three/drei"
import { MeshRetroMaterial } from "../MeshRetroMaterial" 
import { glsl } from "../../../data/utils"
import { useStore } from "../../../data/store"

export function AsteroidStart(props) {
    const { nodes } = useGLTF("/models/ast.glb")
    const materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
                material={materials.floorBase}
            >
                <primitive object={nodes.Cube004.geometry} attach="geometry" /> 
            </mesh>
            <mesh>
                <primitive object={nodes.Cube004_1.geometry} attach="geometry" />
                <MeshRetroMaterial
                    isInstance={false}
                    fragmentShader={glsl`
                        vec3 top = mix(gl_FragColor.rgb, vec3(.0, 1., .6), .84);
                        vec3 bottom = mix(gl_FragColor.rgb, vec3(.0, .5, 1.), .65); 
        
                        gl_FragColor.rgb = mix(top, bottom, clamp(-vGlobalPosition.y / 3., 0., 1.));
                    `}
                />
            </mesh>
        </group>
    )
} 