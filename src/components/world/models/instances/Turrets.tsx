import { useLoader } from "@react-three/fiber"
import { useMemo } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import InstancedMesh from "../InstancedMesh"
import { Mesh } from "three"
import { MeshRetroMaterial } from "../../materials/MeshRetroMaterial"
import { turretColor } from "../../../../data/theme"
import { glsl } from "../../../../data/utils"

export default function Turrets() {
    let count = 14
    let [ turret ] = useLoader(GLTFLoader, [
        "/models/turret.glb", 
    ])  
    let traumaAttributes = useMemo(() => {
        return new Float32Array(new Array(count).fill(0))
    }, [count])

    return ( 
        <InstancedMesh
            name="turret"
            count={count}
            receiveShadow
            //colors
        >
            <primitive
                object={(turret.nodes.turret2 as Mesh).geometry}
                attach="geometry"
            > 
                <instancedBufferAttribute
                    needsUpdate={true}
                    attach="attributes-aTrauma"
                    args={[traumaAttributes, 1, false, 1]}
                />
            </primitive>
            <MeshRetroMaterial
                color={turretColor}
                name="turret"
                emissive={turretColor}
                emissiveIntensity={0.3}
                rightColorIntensity={.3} 
                backColor="#f00"
                backColorIntensity={.1}
                colorCount={8}
                dither={.005}
                shader={{
                    shared: glsl`
                        varying float vTrauma;
                    `,
                    vertex: {
                        head: glsl`
                            attribute float aTrauma;
                        `,
                        main: glsl`
                        vTrauma = aTrauma;
                        /*
                            transformed += normalize(vec3(position.x, 0., position.z)) 
                                * .25 
                                * random(globalPosition.xz + uTime) 
                                * aTrauma ;
                                * */
                        `
                    },
                    fragment: {
                        main: glsl`
                            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.), vTrauma);
                        `
                    }
                }}
            />
        </InstancedMesh>
    )
}