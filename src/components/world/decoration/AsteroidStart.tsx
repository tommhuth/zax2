import { useGLTF } from "@react-three/drei"
import { MeshLambertFogMaterial } from "../MeshLambertFogMaterial"
import { floorColor } from "../../../data/theme"
import { glsl } from "../../../data/utils"
import { useShader } from "../../../data/hooks"

export function AsteroidStart(props) {
    const { nodes, materials } = useGLTF("/models/ast.glb")
    let { onBeforeCompile } = useShader({
        uniforms: {
            uTime: { value: 0 }, 
        },
        vertex: {
            head: glsl`
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime;  
            `,
            main: glsl` 
                vec4 globalPosition =  modelMatrix  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz;
                vPosition = position.xyz; 
            `
        },
        fragment: {
            head: glsl` 
                varying vec3 vPosition;   
                varying vec3 vGlobalPosition;    
                uniform float uTime; 
                uniform vec3 uFogColorStart; 
                uniform vec3 uFogColorEnd;   
            `,
            main: glsl`  
                vec3 top = mix(gl_FragColor.rgb, vec3(.0, 1., .6), .5);
                vec3 bottom = mix(gl_FragColor.rgb, vec3(.0, .5, 1.), .5); 

                gl_FragColor.rgb = mix(top, bottom, clamp(-vPosition.y / 3., 0., 1.));
            `
        }
    })  

    return (
        <group {...props} dispose={null}>
            <group>
                <mesh
                    receiveShadow
                    geometry={nodes.Cube004.geometry}
                    material={materials["Material.001"]}
                >
                    <MeshLambertFogMaterial color={floorColor} fogDensity={0} />
                </mesh>
                <mesh>
                    <primitive object={nodes.Cube004_1.geometry} attach="geometry" />

                    <meshLambertMaterial  
                        onBeforeCompile={onBeforeCompile}
                    />
                </mesh>
            </group>
        </group>
    )
} 