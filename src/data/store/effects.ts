import random from "@huth/random"
import { Tuple2, Tuple3 } from "../../types.global"
import { store } from "."
import { ColorRepresentation, Vector3 } from "three"
import { Explosion, Particle } from "../types"
import { setColorAt, setMatrixAt } from "../utils"
import { ZaxStore } from "./types.store"

function updateEffects(data: Partial<ZaxStore["effects"]>) {
    store.setState({
        effects: {
            ...store.getState().effects,
            ...data
        }
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
    secondaryFireballCount?: number
}

export function createExplosion({
    position,
    count = 12,
    radius = .75,
    fireballPath: [fireballStart, fireballDirection] = [[0, 0, 0], [0, 0, 0]],
    fireballCount = 0,
    secondaryFireballCount = radius > .65 ? random.integer(0, 3) : 0,
    shockwave = random.boolean(.9),
    delay = 0,
}: CreateExplosionParams) {
    return setTimeout(() => {
        let baseLifetime = random.integer(1600, 1800)
        let { instances } = store.getState()

        let explosion: Explosion = {
            position,
            id: random.id(),
            lifetime: baseLifetime * .85,
            time: 0,
            radius: radius * 7 + (fireballCount ? 1.5 : 0),
            shockwave: shockwave || fireballCount ? {
                lifetime: random.float(700, 850),
                radius: random.float(radius * 5, radius * 6),
                time: random.integer(200, 200),
                index: instances.shockwave.index.next(),
            } : null,
            fireballs: [
                ...new Array(secondaryFireballCount).fill(null).map(() => {
                    let angle = random.float(0, Math.PI * 2)
                    let distance = random.float(4, 5)
                    let range = random.float(.75, 1)
                    let duration = random.integer(-650, -500)
                    let durationOffset = random.integer(100, 200)
                    let radiusScaler = random.float(.75, 1.5)

                    return new Array(random.integer(8, 10)).fill(null).map((i, index, list) => {
                        let t = index / (list.length - 1)
                        let radius = random.float(.5, .7)

                        return {
                            index: instances.fireball.index.next(),
                            id: random.id(),
                            position: [
                                position[0] + Math.cos(angle) * distance * t,
                                position[1] - Math.cos(Math.PI * .5 + t * range * Math.PI) * distance * .5 * t + 1,
                                position[2] + Math.sin(angle) * distance * t,
                            ] as Tuple3,
                            startRadius: radius * radiusScaler,
                            maxRadius: 0,
                            time: t * duration + durationOffset,
                            lifetime: random.integer(600, 900),
                            type: "secondary"
                        } satisfies Explosion["fireballs"][number]
                    })
                }).flat(1),
                ...new Array(fireballCount).fill(null).map((i, index) => {
                    let tn = index / (fireballCount - 1)

                    return {
                        index: instances.fireball.index.next(),
                        id: random.id(),
                        position: [
                            fireballStart[0] + tn * fireballDirection[0] + random.float(-.25, .25),
                            fireballStart[1] + tn * fireballDirection[1],
                            fireballStart[2] + tn * fireballDirection[2] + random.float(-.25, .25),
                        ] as Tuple3,
                        startRadius: radius * 1.5,
                        maxRadius: radius * 3.5,
                        time: index * -random.integer(75, 100),
                        lifetime: 1100 + random.integer(0, 200),
                    } satisfies Explosion["fireballs"][number]
                }),
                ...new Array(count).fill(null).map((i, index, list) => {
                    let startRadius = (index / list.length) * (radius * 1.5 - radius * .25) + radius * .25

                    return {
                        index: instances.fireball.index.next(),
                        position: [
                            random.pick(-radius, radius) + position[0],
                            random.float(0, radius * 3) + position[1],
                            random.pick(-radius, radius) + position[2]
                        ] as Tuple3,
                        startRadius,
                        id: random.id(),
                        maxRadius: startRadius * 2.5,
                        time: random.integer(-200, 0),
                        lifetime: random.integer(baseLifetime * .375, baseLifetime * .975),
                    } satisfies Explosion["fireballs"][number]
                })
            ],
        }

        updateEffects({
            explosions: [
                explosion,
                ...store.getState().effects.explosions,
            ]
        })
    }, delay)
}

export function setLastImpactLocation(x: number, y: number, z: number) {
    store.setState({
        effects: {
            ...store.getState().effects,
            lastImpactLocation: [x, y, z]
        },
    })
}
export function setTime(time: number) {
    store.setState({
        effects: {
            ...store.getState().effects,
            time
        },
    })
}

export function setTimeScale(timeScale: number) {
    store.setState({
        effects: {
            ...store.getState().effects,
            timeScale
        },
    })
}

const MAX_TRAUMA = 2

export function setTrauma(amount: number) {
    store.getState().effects.trauma.set(amount, amount)
        .clampScalar(0, MAX_TRAUMA)
}

export function increaseTrauma(amount: number) {
    store.getState().effects.trauma.addScalar(amount)
        .clampScalar(0, MAX_TRAUMA)
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
    color: ColorRepresentation | ColorRepresentation[]
    name?: string
    delay?: number // base delay
    gravity?: Tuple3
}

let _normal = new Vector3()
let _spread = new Vector3()

export function createParticles({
    position = [0, 0, 0],
    offset = [[-1, 1], [-1, 1], [-1, 1]],
    normal = [0, 1, 0],
    spread = [[-.85, .85], [0, .5]],
    speed = [10, 20],
    count = [2, 3],
    friction = [1.25, 1.5], // 0 - 5
    restitution = [.2, .5],
    color,
    radius = [.15, .25],
    stagger = [-150, 0],
    delay = 0,
    gravity = [0, -random.integer(45, 50), 0],
}: CreateParticlesParams) {
    return setTimeout(() => {
        let instance = store.getState().instances.particle
        let amount = Array.isArray(count) ? random.integer(...count) : count
        let particles: Particle[] = new Array(amount).fill(null).map((i, index, list) => {
            normal = _normal.set(...normal)
                .add(_spread.set(
                    random.float(...spread[0]),
                    random.float(...spread[1]),
                    random.float(...spread[0])
                ))
                .normalize()
                .toArray()

            let velocity: Tuple3 = [
                normal[0] * random.float(...speed),
                normal[1] * random.float(...speed),
                normal[2] * random.float(...speed),
            ]
            let j = instance.index.next()

            return {
                id: random.id(),
                instance,
                mounted: false,
                index: j,
                position: position.map((i, index) => i + random.float(...offset[index])) as Tuple3,
                acceleration: gravity as Tuple3,
                rotation: [
                    random.float(0, Math.PI * 2),
                    random.float(0, Math.PI * 2),
                    random.float(0, Math.PI * 2)
                ] as Tuple3,
                velocity,
                restitution: random.float(...restitution),
                friction: typeof friction == "number" ? friction : random.float(...friction),
                radius: typeof radius === "number" ? radius : radius[0] + (radius[1] - radius[0]) * (index / (list.length - 1)),
                color: Array.isArray(color) ? random.pick(...color) : color,
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