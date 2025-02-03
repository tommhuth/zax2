import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import { useStore } from "@data/store"
import { useEffect, useMemo, useRef, useState } from "react"
import { InstancedMesh, Mesh, Vector3 } from "three"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { glsl, ndelta, setColorAt, setMatrixAt } from "@data/utils"
import { Tuple3 } from "src/types.global"

import noise from "../../../shaders/noise.glsl"
import dither from "../../../shaders/dither.glsl"
import utils from "../../../shaders/utils.glsl"
import easings from "../../../shaders/easings.glsl"
import animate from "@huth/animate"
import { setPlayerSpeed } from "@data/store/player"
import { easeOutSine } from "@data/shaping"

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
            <Starfield position={position} />
        </WorldPartWrapper>
    )
}

function Starfield({ position }: { position: Vector3; }) {
    let diagonal = useStore(i => i.world.diagonal)
    let count = Math.ceil(diagonal / .015)
    let player = useStore(i => i.player)
    let state = useStore(i => i.state)
    let [minSpeed, maxSpeed] = [1, 50]
    let colorData = useMemo(() => new Float32Array(count * 3).fill(1), [count])
    let [instance, setInstance] = useState<InstancedMesh | null>(null)
    let ref = useRef<Mesh>(null)
    let stars = useMemo(() => {
        return Array.from({ length: count })
            .fill(null)
            .map((i, index) => ({
                position: [
                    random.float(-15, 20),
                    random.float(-10, -4),
                    position.z + random.float(-10, diagonal)
                ] as Tuple3,
                id: random.id(),
                radius: random.float(.025, .075),
                length: 6,
                speed: random.integer(minSpeed, maxSpeed),
                color: random.integer(0, 255),
                index,
            }))
    }, [position, minSpeed, count, diagonal, maxSpeed])
    let uniforms = useMemo(() => {
        return {
            uTime: { value: 0 },
            uSpeed: { value: 1 }
        }
    }, [])
    let speed = useRef(0)
    let hasInitialized = useRef(false)

    useEffect(() => {
        if (state === "running" && !hasInitialized.current) {
            hasInitialized.current = true
            animate({
                from: 0,
                to: 1,
                duration: 1600,
                easing: easeOutSine,
                render(value) {
                    speed.current = value
                    setPlayerSpeed(value * 4)
                },
            })
        }
    }, [state])

    useFrame((state, delta) => {
        uniforms.uSpeed.value = 1 - speed.current
        uniforms.uTime.value += ndelta(delta)
    })

    useFrame((state, delta) => {
        if (!instance) {
            return
        }

        for (let star of stars) {
            let t = speed.current

            star.position[2] -= star.speed * ndelta(delta) * (1 - t)

            if (star.position[2] < player.position.z - diagonal) {
                star.position[2] += diagonal * 3 + star.length
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
                scale: [
                    star.radius,
                    star.radius,
                    star.radius + (t - 1) * star.length * (star.speed - 10) / 30
                ]
            })
        }
    })

    useFrame(() => {
        if (!player.object || !ref.current) {
            return
        }

        ref.current.position.z = player.object.position.z
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
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial name="star" color="white" />
            </instancedMesh>

            <mesh
                ref={ref}
                position-x={11}
                position-y={-3.75}
            >
                <planeGeometry
                    args={[30, diagonal * 3, 1, 1]}
                    onUpdate={e => e.rotateX(-Math.PI * .5)}
                />
                <shaderMaterial
                    transparent
                    uniforms={uniforms}
                    name="hyperspeed"
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
                            float width = 26. * uSpeed;
                            float n = (noise(vPosition * vec3(.1, .1, .05) + vec3(0., uTime * .5, uTime * 1.)) + 1.) / 2.;
                            float edge = 1. - sat(abs(vPosition.x + 3.) / (width * .5)); 

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
                                easeOutCubic(sat(abs(vPosition.x + 3.) / 3.)) - n * .85
                            ) ;

                            gl_FragColor.a = easeInCubic(sat(edge + n * (1. - edge) * uSpeed));
                            gl_FragColor.a = luma(dither(gl_FragCoord.xy, vec3(gl_FragColor.a), 3., .02)); 
                            gl_FragColor.a = smoothstep(0.25, .75, gl_FragColor.a);
                        }
                    `}
                />
            </mesh>
        </>
    )
}