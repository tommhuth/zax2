import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import { useStore } from "@data/store"
import model from "@assets/models/asteroid.glb"
import { useGLTF } from "@react-three/drei"
import { MeshRetroMaterial } from "../materials/MeshRetroMaterial"
import Grass from "../actors/Grass"
import Dirt from "../actors/Dirt"
import Plant from "../actors/Plant"
import { ComponentPropsWithoutRef, useMemo, useRef, useState } from "react"
import { InstancedMesh, Mesh, Vector3 } from "three"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { clamp, glsl, ndelta, setColorAt, setMatrixAt } from "@data/utils"
import { GLTFModel, Tuple2, Tuple3 } from "src/types.global"
import { easeInOutCubic } from "@data/shaping"

import noise from "../../../shaders/noise.glsl"
import dither from "../../../shaders/dither.glsl"
import utils from "../../../shaders/utils.glsl"
import easings from "../../../shaders/easings.glsl"

export default function Start({
    id,
    position,
    size,
}: WorldPart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Asteroid position={[3, 0, size[1] + position.z]} />
            <Starfield position={position} size={size} />

            <Plant position={[-5, 0, size[1] + -2]} />
            <Grass position={[11, 0, size[1] + -5]} rotation={-.6} />
            <Dirt position={[6, 0, size[1] + -8]} scale={1.5} />
            <Dirt position={[-1, 0, size[1] + -5]} scale={1.25} rotation={2} />
        </WorldPartWrapper>
    )
}

function Starfield({ position, count = 200, size }: { position: Vector3; count?: number; size: Tuple2 }) {
    let diagonal = useStore(i => i.world.diagonal)
    let player = useStore(i => i.player)
    let colorData = useMemo(() => new Float32Array(count * 3).fill(1), [count])
    let [instance, setInstance] = useState<InstancedMesh | null>(null)
    let ref = useRef<Mesh>(null)
    let stars = useMemo(() => {
        return Array.from({ length: count })
            .fill(null)
            .map((i, index) => ({
                position: [
                    random.float(-15, 20),
                    random.float(-6, -3),
                    position.z + random.float(-10, size[1])
                ] as Tuple3,
                id: random.id(),
                radius: random.float(.025, .075),
                length: random.float(3, 8),
                speed: random.integer(15, 30),
                color: random.integer(0, 255),
                index,
            }))
    }, [count, size, position])
    let uniforms = useMemo(() => {
        return {
            uTime: { value: 0 },
            uSpeed: { value: 1 }
        }
    }, [])

    useFrame((state, delta) => {
        let startAt = position.z + size[1] * .25
        let exitDistance = 2
        let t = (clamp((startAt - player.position.z) / (exitDistance), 0, 1))

        uniforms.uSpeed.value = t
        uniforms.uTime.value += ndelta(delta)
    })

    useFrame((state, delta) => {
        if (!instance) {
            return
        }

        let startAt = position.z + size[1] * .35
        let exitDistance = 5

        for (let star of stars) {
            let t = easeInOutCubic(
                1 - clamp((startAt - player.position.z - star.speed * .05) / exitDistance, 0, 1)
            )

            star.position[2] -= star.speed * delta * (1 - t)

            if (star.position[2] < player.position.z - diagonal * 1) {
                star.position[2] += diagonal * 2 + star.length
            }

            setColorAt(instance, star.index, `rgb(${star.color * .5}, ${star.color}, 255)`)
            setMatrixAt({
                instance: instance,
                index: star.index,
                position: [
                    star.position[0],
                    star.position[1],
                    star.position[2] - (t - 1) * star.length * .25,
                ],
                scale: [star.radius, star.radius, star.radius + (t - 1) * star.length]
            })
        }
    })


    useFrame(() => {
        if (!player.object || !ref.current) {
            return
        }

        ref.current.position.z = player.object.position.z + 6
    })

    return (
        <>
            <instancedMesh
                ref={setInstance}
                args={[undefined, undefined, count]}
            >
                <instancedBufferAttribute
                    attach="instanceColor"
                    args={[colorData, 3, false]}
                />
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="white" />
            </instancedMesh>

            <mesh
                ref={ref}
                position-x={11}
                position-y={-6}
            >
                <planeGeometry
                    args={[15, diagonal * 2, 1, 1]}
                    onUpdate={e => e.rotateX(-Math.PI * .5)}
                />
                <shaderMaterial
                    transparent
                    uniforms={uniforms}
                    vertexShader={glsl`
                        varying vec3 vPosition;

                        void main() {
                            vPosition = position;

                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }    
                    `}
                    fragmentShader={glsl`
                        varying vec3 vPosition;
                        uniform float uTime;
                        uniform float uSpeed;

                        ${noise}
                        ${dither}
                        ${utils}
                        ${easings}

                        float sat(float x) {
                            return clamp(x, 0., 1.);
                        }

                        void main() {
                            float width = 26.;
                            float n = (noise(vPosition * .1 + vec3(0., uTime, uTime)) + 1.) / 2.;
                            float edge = 1. - sat(abs(vPosition.x) / (width * .5)); 

                            // big stroke
                            gl_FragColor.rgb = mix(
                                vec3(1., 1., 1.),
                                vec3(0., 0., 1.),
                                easeInOutQuad(edge) 
                            );

                            gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 3., .03);

                            // narrow stroke 
                            gl_FragColor.rgb = mix(
                                vec3(1.),
                                gl_FragColor.rgb,
                                easeOutCubic(sat(abs(vPosition.x+2.) / 2.))  - n * .5
                            );

                            gl_FragColor.a = luma(dither(gl_FragCoord.xy, vec3(easeInCubic(sat(edge + n * (1. - edge)))) * uSpeed, 3., .02));  
                        }
                    `}
                />
            </mesh>
        </>
    )
}



useGLTF.preload(model)

export function Asteroid(props: ComponentPropsWithoutRef<"group">) {
    let { nodes } = useGLTF(model) as GLTFModel<["Plane001", "Plane001_1"]>
    let materials = useStore(i => i.materials)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane001_1.geometry}
                material={materials.floorBase}
            />
            <mesh
                geometry={nodes.Plane001.geometry}
                castShadow
                receiveShadow
            >
                <MeshRetroMaterial
                    color="#5e00c9"
                    emissive={"#5e00c9"}
                    fog={.1}
                    emissiveIntensity={.2}
                    rightColorIntensity={0}
                    backColorIntensity={0}
                    shader={{
                        fragment: {
                            main: glsl` 
                                    float n = (noise(vGlobalPosition * .25 + uTime * .5) + 1.) / 2.;
                                    vec3 highlightPosition = vec3(-1., -.2, -.25) * n;

                                    gl_FragColor.rgb = mix(
                                        gl_FragColor.rgb, 
                                        vec3(0., 0., .1), 
                                        easeInQuad(clamp(-vPosition.y / 2.2, 0., 1.))  
                                    );
 
                                    gl_FragColor.rgb = mix(
                                        gl_FragColor.rgb, 
                                        vec3(1., 0., 0.), 
                                        clamp(dot(vGlobalNormal, highlightPosition), 0., 1.)
                                    );
                                `
                        }
                    }}
                />
            </mesh>
        </group>
    )
}