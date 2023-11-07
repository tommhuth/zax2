import { useGLTF } from "@react-three/drei"
import { MeshLambertFogMaterial } from "../MeshLambertFogMaterial"
import { floorColor, fogColorEnd, plantColorStart } from "../../../data/theme"
import { glsl } from "../../../data/utils"
import { useShader } from "../../../data/hooks"
import { useFrame } from "@react-three/fiber"

export function AsteroidStart(props) {
    const { nodes, materials } = useGLTF("/models/ast.glb")
    let { onBeforeCompile, uniforms } = useShader({
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
                    <MeshLambertFogMaterial color={floorColor} />
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

/*

                    <meshLambertMaterial color="red" />

                    <MeshLambertFogMaterial
                        fogDensity={.0}  
                        attach="material"
                        isInstance={false}
                        debug
                        fragmentShader={glsl`
                            gl_FragColor.rgb = mix(vec3(1., 0., 0.), vec3(0., 0., 1.), clamp(-vPosition.y / 3., 0., 1.));
                        `}
                    />
                    */