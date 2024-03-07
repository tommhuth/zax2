import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { BufferGeometry, Material, Mesh } from "three"
import random from "@huth/random"
import { useShader } from "../data/hooks"
import { glsl } from "../data/utils"

export default function PlayerExhaust() {
    let flameRef = useRef<Mesh<BufferGeometry, Material> | null>(null)
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl`
                varying vec3 vPosition;
            `,
            main: glsl`
                vPosition = position;
            `
        },
        fragment: {
            head: glsl`
                varying vec3 vPosition;
            `,
            main: glsl`
                gl_FragColor.a = clamp((vPosition.z + .5 ) / 1., 0., 1.);
            `
        }
    })

    useFrame(() => {
        if (flameRef.current) {
            flameRef.current.scale.x = random.float(.4, .6)
            flameRef.current.scale.z = random.float(1.3, 1.5) 
            flameRef.current.material.opacity = random.float(.85, 1)
        }
    })

    return (
        <>
            <mesh
                scale={[.5, .21, 1]}
                ref={flameRef}
                position-z={-3.25}
                position-y={-.25}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    onBeforeCompile={onBeforeCompile}
                    color="white"
                    transparent
                    name="exhaust"
                />
            </mesh>
        </>
    )
}