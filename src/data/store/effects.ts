import random from "@huth/random"
import { Tuple2, Tuple3 } from "../../types"
import { Store, store } from "."
import { ColorRepresentation, Vector3 } from "three"
import { Particle } from "../types"
import { setCameraShake } from "./player"
import { clamp, setColorAt, setMatrixAt } from "../utils"
import { easeOutCubic } from "../shaping"

function updateEffects(data: Partial<Store["effects"]>) {
    store.setState({
        effects: {
            ...store.getState().effects,
            ...data
        }
    })
}

interface CreateShimmerParams {
    position: Tuple3
    count?: [min: number, max: number]
    size?: Tuple3
    radius?: [min: number, max: number]
}

export function createShimmer({
    position = [0, 0, 0],
    count = [6, 15],
    size = [4, 4, 4],
    radius = [.05, .2]
}: CreateShimmerParams) {
    let instance = store.getState().instances.shimmer

    updateEffects({
        shimmer: [
            ...store.getState().effects.shimmer,
            ...new Array(random.integer(...count)).fill(null).map(() => {
                let offsetPosition = new Vector3(
                    position[0] + random.float(-size[0] / 2, size[0] / 2),
                    position[1] + random.float(-size[1] / 2, size[1] / 2),
                    position[2] + random.float(-size[2] / 2, size[2] / 2),
                )
                let speed = offsetPosition.clone()
                    .sub(new Vector3(...position))
                    .normalize()
                    .multiplyScalar(5)

                return {
                    id: random.id(),
                    index: instance.index.next(),
                    opacity: random.float(.4, 1),
                    gravity: random.float(.1, 1.5),
                    speed,
                    time: random.integer(-400, 0),
                    radius: random.float(...radius),
                    lifetime: random.integer(2500, 5000),
                    friction: random.float(.2, .6),
                    position: new Vector3(...position),
                }
            })
        ]
    })
}

export function removeShimmer(id: string | string[]) {
    updateEffects({
        shimmer: store.getState().effects.shimmer.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}

interface CreateExplosionParams {
    position: Tuple3
    count?: number
    radius?: number
    fireballPath?: [start: Tuple3, direction: Tuple3]
    fireballCount?: number
    shockwave?: boolean
    delay?: number
}

export function createExplosion({
    position,
    count = 12,
    radius = .75,
    fireballPath: [fireballStart, fireballDirection] = [[0, 0, 0], [0, 0, 0]],
    fireballCount = 0,
    shockwave = random.boolean(.5),
    delay = 0,
}: CreateExplosionParams) {
    setTimeout(() => {
        let baseLifetime = random.integer(1600, 1800)
        let fireBallInstance = store.getState().instances.fireball
        let shockwaveInstance = store.getState().instances.shockwave
        let blastInstance = store.getState().instances.blast
        let { cameraShake, object } = store.getState().player
        let playerZ = object?.position.z || 0
        let shake = 1 - clamp(Math.abs(playerZ - position[2]) / 5, 0, 1)

        setCameraShake(Math.min(cameraShake + easeOutCubic(shake), 1))
        updateEffects({
            explosions: [
                {
                    position,
                    id: random.id(),
                    radius: radius * 7 + (fireballCount ? 1.5 : 0),
                    blast: {
                        lifetime: random.float(baseLifetime * 1.25, baseLifetime * 1.5) * .3,
                        radius: radius * 6,
                        time: 0,
                        index: blastInstance.index.next(),
                    },
                    shockwave: shockwave || fireballCount ? {
                        lifetime: random.float(baseLifetime * .5, baseLifetime * .65),
                        radius: random.float(radius * 2.5, radius * 3),
                        time: random.integer(100, 300),
                        index: shockwaveInstance.index.next(),
                    } : null,
                    fireballs: [
                        {
                            id: random.id(),
                            index: fireBallInstance.index.next(),
                            position,
                            startRadius: radius * .25,
                            maxRadius: radius,
                            time: 0,
                            lifetime: baseLifetime * 1.5
                        },
                        ...new Array(fireballCount).fill(null).map((i, index) => {
                            let tn = index / (fireballCount - 1)

                            return {
                                index: fireBallInstance.index.next(),
                                id: random.id(),
                                position: [
                                    fireballStart[0] + tn * fireballDirection[0] + random.float(-.25, .25),
                                    fireballStart[1] + tn * fireballDirection[1],
                                    fireballStart[2] + tn * fireballDirection[2] + random.float(-.25, .25),
                                ] as Tuple3,
                                startRadius: radius * 1.5,
                                maxRadius: radius * 3.5,
                                time: index * -random.integer(75, 100),
                                lifetime: 750 * 1.5 + random.integer(0, 200)
                            }
                        }),
                        ...new Array(count).fill(null).map((i, index, list) => {
                            let startRadius = (index / list.length) * (radius * 1.5 - radius * .25) + radius * .25

                            return {
                                index: fireBallInstance.index.next(),
                                position: [
                                    random.pick(-radius, radius) + position[0],
                                    random.float(0, radius * 3) + position[1],
                                    random.pick(-radius, radius) + position[2]
                                ] as Tuple3,
                                startRadius,
                                id: random.id(),
                                maxRadius: startRadius * 2.5,
                                time: random.integer(-200, 0),
                                lifetime: random.integer(baseLifetime * .25, baseLifetime * .65) * 1.5
                            }
                        })
                    ],
                },
                ...store.getState().effects.explosions,
            ]
        })
    }, delay)
}

export function createImpactDecal(
    position: Tuple3,
    scale = random.float(2, 3),
) {
    let { decal } = store.getState().instances
    let index = decal.index.next()

    setMatrixAt({
        instance: decal.mesh,
        index,
        scale: [scale, scale, scale],
        rotation: [-Math.PI * .5, 0, random.float(0, Math.PI * 2)],
        position: [position[0], position[1] + random.float(.1, .2), position[2]],
    })
}

export function removeExplosion(id: string | string[]) {
    updateEffects({
        explosions: store.getState().effects.explosions.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}

export function createScrap(
    position: Tuple3,
    radius: number,
    color: ColorRepresentation = "red",
) {
    let instance = store.getState().instances.scrap
    let index = instance.index.next()

    setColorAt(instance.mesh, index, color)
    setMatrixAt({
        instance: instance.mesh,
        index,
        position: [
            position[0],
            position[1] - random.float(0, .15) * radius,
            position[2],
        ],
        rotation: [
            random.float(0, Math.PI * 2),
            random.float(0, Math.PI * 2),
            random.float(0, Math.PI * 2),
        ],
        scale: [
            random.float(.85, 1.15) * radius,
            random.float(.85, 1.15) * radius,
            random.float(.85, 1.15) * radius,
        ],
    })
}

interface CreateParticlesParams {
    position: Tuple3 // base position
    offset?: [x: Tuple2, y: Tuple2, z: Tuple2] // additional position offset
    normal: Tuple3 // main particle direction
    speed?: Tuple2 // base speed 
    spread?: [xz: Tuple2, y: Tuple2] // normal offset
    count?: Tuple2 | number
    restitution?: Tuple2
    stagger?: Tuple2 // individual delay in ms
    friction?: Tuple2 | number
    radius?: Tuple2 | number
    color?: string
    name?: string
    delay?: number // base delay
}

let _vec3 = new Vector3()

export function createParticles({
    position = [0, 0, 0],
    offset = [[-1, 1], [-1, 1], [-1, 1]],
    normal = [0, 1, 0],
    spread = [[-.85, .85], [0, .5]],
    speed = [10, 20],
    count = [2, 3],
    friction = [1.25, 1.5], // 0 - 5
    restitution = [.2, .5],
    color = "#FFFFFF",
    radius = [.15, .25],
    stagger = [-150, 0],
    delay = 0,
}: CreateParticlesParams) {
    setTimeout(() => {
        let gravity = [0, -50, 0]
        let instance = store.getState().instances.particle
        let amount = Array.isArray(count) ? random.integer(...count) : count
        let particles: Particle[] = new Array(amount).fill(null).map((i, index, list) => {
            normal = _vec3.set(...normal)
                .add(new Vector3(
                    random.float(...spread[0]),
                    random.float(...spread[1]),
                    random.float(...spread[0])
                ))
                .normalize()
                .toArray()

            let velocity = new Vector3(
                normal[0] * random.float(...speed),
                normal[1] * random.float(...speed),
                normal[2] * random.float(...speed),
            )
            let j = instance.index.next()

            return {
                id: random.id(),
                instance,
                mounted: false,
                index: j,
                position: new Vector3(
                    ...position.map((i, index) => i + random.float(...offset[index]))
                ),
                acceleration: new Vector3(...gravity),
                rotation: new Vector3(
                    random.float(0, Math.PI * 2),
                    random.float(0, Math.PI * 2),
                    random.float(0, Math.PI * 2)
                ),
                velocity,
                restitution: random.float(...restitution),
                friction: typeof friction == "number" ? friction : random.float(...friction),
                radius: typeof radius === "number" ? radius : radius[0] + (radius[1] - radius[0]) * (index / (list.length - 1)),
                color,
                time: random.integer(...stagger),
            }
        })

        updateEffects({
            particles: [
                ...store.getState().effects.particles,
                ...particles,
            ]
        })
    }, delay)
}

export function removeParticle(id: string | string[]) {
    updateEffects({
        particles: store.getState().effects.particles.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}