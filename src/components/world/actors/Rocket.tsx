import { startTransition, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Owner, Rocket } from "../../../data/types"
import { useInstance } from "../models/InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { clamp, glsl, ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { InstancedMesh, Mesh, Vector3 } from "three"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { WORLD_TOP_EDGE } from "../World"
import Config from "../../../data/Config"
import { useStore } from "../../../data/store"
import { increaseScore } from "../../../data/store/player"
import { damageRocket, removeRocket } from "../../../data/store/actors"
import { createExplosion, createParticles, createShimmer } from "../../../data/store/effects"
import { useBulletCollision } from "../../../data/collisions"
import { rocketColor } from "../../../data/theme"
import { MeshRetroMaterial } from "../MeshRetroMaterial"
import { useShader } from "../../../data/hooks"
import dither from "../../../shaders/dither.glsl"
import easings from "../../../shaders/easings.glsl"

let _size = new Vector3()

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function explode(position: Vector3, size: Tuple3) {
    let shouldDoFireball = position.y < 2

    createShimmer({
        position: [
            position.x,
            position.y + size[1] / 2,
            position.z,
        ],
        count: [30, 50],
        size: [3, 6, 3]
    })

    if (shouldDoFireball) {
        createParticles({
            position: position.toArray(),
            speed: [15, 25],
            speedOffset: [[-5, 5], [0, 5], [-5, 5]],
            positionOffset: [[-.5, .5], [0, 1], [-.5, .5]],
            normal: [0, 1, 0],
            normalOffset: [[-.5, .5], [0, 0], [-.5, .5]],
            count: [10, 15],
            radius: [.2, .6],
            color: rocketColor,
        })

        createExplosion({
            position: [position.x, 0, position.z],
            count: 16,
            shockwave: false,
            radius: random.float(.65, .75),
            fireballCount: 8,
            fireballPath: [[position.x, 0, position.z], [0, 6, 0]]
        })
    } else {
        type ExplosionPart = [delay: number, offset: Tuple3, radius: number]
        let explosions: ExplosionPart[] = [
            [125, [.2, size[1] / 2 - .2, .3], .2],
            [0, [-.2, -size[1] / 2, -.25], .3]
        ]

        for (let [delay, [x, y, z], radius] of explosions) {
            setTimeout(() => {
                createExplosion({
                    position: [position.x + x, position.y + y, position.z + z],
                    count: 10,
                    shockwave: false,
                    radius,
                })
            }, delay)
        }

        setTimeout(() => {
            createExplosion({
                position: [position.x, position.y, position.z],
                count: 20,
                radius: random.float(.8, 1),
            })

            createParticles({
                position: position.toArray(),
                speed: [5, 20],
                speedOffset: [[-0, 0], [-0, 0], [-0, 0]],
                positionOffset: [[-.5, .5], [-1, 1], [-.5, .5]],
                normal: [0, 0, 0],
                normalOffset: [[-1, 1], [-1, 1], [-1, 1]],
                count: [10, 15],
                radius: [.1, .55],
                color: rocketColor,
            })
        }, 320)
    }
}

interface Smoke {
    id: string
    position: Tuple3
    velocity: Tuple3
    time: number
    index: number
    radius: number
    mradius: number
    grow: number
    t: number
}

let si = 0

let _vec3 = new Vector3()

function randomdir() {
    return _vec3.set(random.float(-1, 1), 0, random.float(-1, 1)).normalize().toArray()
}

export default function Rocket({
    position,
    aabb,
    size = [1, 2, 1],
    id,
    client,
    speed,
    health,
}: Rocket) {
    let grid = useStore(i => i.world.grid)
    let iref = useRef<InstancedMesh>(null)
    let [smoke, setSmoke] = useState<Smoke[]>([])
    let lastSmoke = useRef(0)
    let data = useMemo(() => {
        return { removed: false, speed, triggerZ: 25, rotationY: random.float(0, Math.PI * 2) }
    }, [speed])
    let ref = useRef<Mesh>(null)
    let [rocketIndex, rocketInstance] = useInstance("rocket", { reset: false, color: "#FFF" })
    let remove = () => {
        data.removed = true
        increaseScore(500)
        removeRocket(id)
        setMatrixNullAt(rocketInstance, rocketIndex as number)
    }

    let shader = useShader({
        vertex: {
            head: glsl` 
                varying vec3 vGlobalPosition;    
            `,
            main: glsl` 
                vec4 globalPosition = instanceMatrix  * vec4(position, 1.);

                vGlobalPosition = globalPosition.xyz; 
            `
        },
        fragment: {
            head: glsl`
                varying vec3 vGlobalPosition;

                ${dither}
                ${easings} 
            `,
            main: glsl`
                gl_FragColor.rgb = dither(gl_FragCoord.xy, gl_FragColor.rgb, 16., .005);
                gl_FragColor.a = easeOutQuad(clamp(vGlobalPosition.y / .75, 0., 1.));
            `
        }
    })

    useBulletCollision({
        name: "bulletcollision:rocket",
        handler: ({ detail: { bullet, intersection, client, normal } }) => {
            if (bullet.owner !== Owner.PLAYER || client.data.id !== id) {
                return
            }

            damageRocket(id, bullet.damage)
            createParticles({
                position: intersection,
                count: [2, 4],
                speed: [8, 12],
                positionOffset: [[0, 0], [0, 0], [0, 0]],
                speedOffset: [[-5, 5], [0, 0], [-5, 5]],
                normal,
                color: "purple",
            })
        }
    })

    useInstance("platform", {
        color: "#ddd",
        reset: false,
        position: [position.x, 0, position.z],
        rotation: [0, random.float(0, Math.PI * 2), 0]
    })

    useLayoutEffect(() => {
        if (health === 0) {
            startTransition(() => {
                setTimeout(() => remove(), 450)
                explode(position, size)
            })
        }
    }, [health])

    useFrame((state, delta) => {
        let { player } = useStore.getState()
        let d = ndelta(delta)

        if (rocketInstance && typeof rocketIndex === "number" && !data.removed && player.object) {
            if (Math.abs(position.z - player.object.position.z) < data.triggerZ) {
                position.y += data.speed * d

                if (health === 0) {
                    data.speed -= .1
                } else if (position.y > WORLD_TOP_EDGE + 2) {
                    data.speed += .75
                } else {
                    data.speed += .01
                }
            }

            aabb.setFromCenterAndSize(position, _size.set(...size))
            setMatrixAt({
                instance: rocketInstance,
                index: rocketIndex,
                position: position.toArray(),
                rotation: [0, data.rotationY, 0]
            })

            ref.current?.position.copy(position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    useFrame((state, delta) => {
        let smokeinterval = random.integer(15, 30)

        if (new Date().getTime() - lastSmoke.current > smokeinterval && position.y > 1 && position.y < 8) {
            let v = randomdir()

            setSmoke([
                {
                    id: random.id(),
                    time: 0,
                    index: si++ % 100,
                    radius: random.float(.2, .35),
                    mradius: random.float(.5, 3),
                    grow: random.float(.1, .5),
                    t: random.integer(300, 1500),
                    velocity: [
                        v[0] * random.float(2, 3.5),
                        -random.float(4, 6),
                        v[2] * random.float(2, 3.5),
                    ],
                    position: [
                        position.x + random.float(-.1, .1),
                        position.y - size[1] / 2,
                        position.z + random.float(-.1, .1)
                    ]
                },
                ...smoke
            ])
            lastSmoke.current = new Date().getTime()
        }

        for (let s of smoke) {
            let { radius, index, position, velocity, id } = s

            if (s.radius < .05) {
                setMatrixNullAt(iref.current, index)
                setSmoke(smoke.filter(i => i.id !== id))

                return
            }

            let offe = 1 - easeInOutCubic(clamp((position[1]) / 3, 0, 1))
            let noffe = 1 - easeInOutCubic(clamp((s.time) / s.t, 0, 1))
            let g = 1 - clamp((s.time - 2000) / (s.t * 2 + 2000), 0, 1)

            position[0] += velocity[0] * delta * noffe * offe
            position[1] += velocity[1] * delta
            position[2] += velocity[2] * delta * noffe * offe

            velocity[0] += .8 * delta
            velocity[1] += .4 * delta
            velocity[2] += .8 * delta

            position[1] = Math.max(position[1], 0)

            if (position[1] === 0) {

                s.time += delta * 1000
            }

            s.radius += .3 * delta + delta * s.grow * (1 - noffe) //  Math.min(s.radius + delta * .2, s.mradius) +

            s.radius *= g

            s.radius = Math.min(s.radius, s.mradius)

            setMatrixAt({
                instance: iref.current,
                index,
                position,
                scale: radius,
            })
        }
    })

    return (
        <>
            <instancedMesh ref={iref} args={[undefined, undefined, 100]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshLambertMaterial 
                    transparent 
                    color="#cbecff"
                    emissive={"#fff"}
                    attach={"material"}
                    emissiveIntensity={.65}
                    dithering
                    onBeforeCompile={shader.onBeforeCompile}
                />
            </instancedMesh>
        </>
    )

    if (!Config.DEBUG) {
        return null
    }

    return (
        <mesh position={position.toArray()} ref={ref}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" name="debug" />
        </mesh>
    )
}