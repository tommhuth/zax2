import random from "@huth/random"
import { Tuple2, Tuple3 } from "../../types"
import { Store, store } from "../store"
import { Vector3 } from "three"
import { Particle } from "../types"
import { setCameraShake } from "./player"
import { clamp } from "three/src/math/MathUtils"

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
                    .multiplyScalar(4)

                return {
                    id: random.id(),
                    index: instance.index.next(),
                    gravity: random.float(.1, 1.5),
                    speed: speed.toArray(),
                    time: random.integer(-300, -250),
                    radius: random.float(...radius),
                    lifetime: random.integer(1500, 6000),
                    friction: random.float(.3, .5),
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
}

export function createExplosion({
    position,
    count = 12,
    radius = .75,
    fireballPath: [fireballStart, fireballDirection] = [[0, 0, 0], [0, 0, 0]],
    fireballCount = 0, 
}: CreateExplosionParams) {
    let baseLifetime = random.integer(1600, 1800)
    let instance = store.getState().instances.fireball
    let { cameraShake, object } = store.getState().player
    let playerZ = object?.position.z || 0
    let shake = 1 - clamp(Math.abs(playerZ - position[2]) / 8, 0, .75)

    radius *= random.float(1, 1.15)

    setCameraShake(Math.min(cameraShake + .15 + .25 * shake, 1)) 
    updateEffects({
        explosions: [
            {
                position,
                id: random.id(),
                fireballs: [
                    {
                        id: random.id(),
                        index: instance.index.next(),
                        position,
                        startRadius: radius * .25,
                        maxRadius: radius,
                        time: 0,
                        lifetime: baseLifetime
                    },
                    ...new Array(fireballCount).fill(null).map((i, index) => {
                        let tn = index / (fireballCount - 1)

                        return {
                            index: instance.index.next(),
                            id: random.id(),
                            position: [
                                fireballStart[0] + tn * fireballDirection[0] + random.float(-.25, .25),
                                fireballStart[1] + tn * fireballDirection[1],
                                fireballStart[2] + tn * fireballDirection[2] + random.float(-.25, .25),
                            ] as Tuple3,
                            startRadius: radius * 1.5,
                            maxRadius: radius * 3.5,
                            time: index * -random.integer(75, 100),
                            lifetime: 750 + random.integer(0, 200)
                        }
                    }),
                    ...new Array(count).fill(null).map((i, index, list) => {
                        let startRadius = (index / list.length) * (radius * 1.5 - radius * .25) + radius * .25

                        return {
                            index: instance.index.next(),
                            position: [
                                random.pick(-radius, radius) + position[0],
                                random.float(0, radius * 3) + position[1],
                                random.pick(-radius, radius) + position[2]
                            ] as Tuple3,
                            startRadius,
                            id: random.id(),
                            maxRadius: startRadius * 2.5,
                            time: random.integer(-200, 0),
                            lifetime: random.integer(baseLifetime * .25, baseLifetime * .65)
                        }
                    })
                ],
            },
            ...store.getState().effects.explosions,
        ]
    })
}

export function removeExplosion(id: string | string[]) {
    updateEffects({
        explosions: store.getState().effects.explosions.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}

interface CreateParticlesParams {
    gravity?: Tuple3
    position: Tuple3 // base position
    positionOffset?: [x: Tuple2, y: Tuple2, z: Tuple2] // additional position offset: ;
    normal: Tuple3 // main particle direction
    speed?: Tuple2 // speed along normal
    speedOffset?: [x: Tuple2, y: Tuple2, z: Tuple2] // additional speed offset
    normalOffset?: [x: Tuple2, y: Tuple2, z: Tuple2]
    count?: Tuple2 | number
    restitution?: Tuple2
    friction?: Tuple2 | number
    radius?: Tuple2 | number
    color?: string
    name?: string
}

export function createParticles({
    name = "sphere",
    position = [0, 0, 0],
    positionOffset = [[-1, 1], [-1, 1], [-1, 1]],
    normal = [0, 1, 0],
    normalOffset = [[-.2, .2], [-.2, .2], [-.2, .2]],
    speed = [10, 20],
    speedOffset = [[0, 0], [0, 0], [0, 0]],
    count = [2, 3],
    friction = [.9, .98],
    gravity = [0, -50, 0],
    restitution = [.2, .5],
    color = "#FFFFFF",
    radius = [.15, .25],
}: CreateParticlesParams) {
    let instance = store.getState().instances[name]
    let particles: Particle[] = new Array(typeof count === "number" ? count : random.integer(...count)).fill(null).map((i, index, list) => {
        let velocity = new Vector3(
            (normal[0] + random.float(...normalOffset[0])) * random.float(...speed) + random.float(...speedOffset[0]),
            (normal[1] + random.float(...normalOffset[1])) * random.float(...speed) + random.float(...speedOffset[1]),
            (normal[2] + random.float(...normalOffset[2])) * random.float(...speed) + random.float(...speedOffset[2]),
        )

        return {
            id: random.id(),
            instance,
            mounted: false,
            index: instance.index.next(),
            position: new Vector3(...position.map((i, index) => i + random.float(...positionOffset[index]))),
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
            lifetime: 0,
            maxLifetime: velocity.length() * 10,
        }
    })

    updateEffects({
        particles: [
            ...store.getState().effects.particles,
            ...particles,
        ]
    })
}

export function removeParticle(id: string | string[]) {
    updateEffects({
        particles: store.getState().effects.particles.filter(i => Array.isArray(id) ? !id.includes(i.id) : i.id !== id)
    })
}