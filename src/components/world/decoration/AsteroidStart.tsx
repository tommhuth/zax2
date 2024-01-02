import { useGLTF } from "@react-three/drei"
import { MeshLambertFogMaterial } from "../MeshLambertFogMaterial"
import { floorColor, floorFogIntensity } from "../../../data/theme"
import { glsl } from "../../../data/utils" 

export function AsteroidStart(props) {
    const { nodes, materials } = useGLTF("/models/ast.glb") 

    return (
        <group {...props} dispose={null}>
            <mesh
                receiveShadow
            >
                <primitive object={nodes.Cube004.geometry} attach="geometry" />
                <MeshLambertFogMaterial
                    color={floorColor}
                    isInstance={false}
                    fogDensity={floorFogIntensity}
                />
            </mesh>
            <mesh>
                <primitive object={nodes.Cube004_1.geometry} attach="geometry" />

                <MeshLambertFogMaterial 
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