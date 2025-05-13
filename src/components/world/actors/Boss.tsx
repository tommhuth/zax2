import { startTransition, useEffect, useMemo, useRef } from "react"
import {
    createHeatSeaker,
    damageBoss,
    defeatBoss,
} from "../../../data/store/boss"
import { Group, InstancedMesh, SphereGeometry, Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { Tuple3 } from "../../../types.global"
import HeatSeaker from "./HeatSeaker"
import { createExplosion, createImpactDecal, createParticles, increaseTrauma } from "../../../data/store/effects"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { BossState, Owner } from "../../../data/types"
import DebugBox from "@components/DebugBox"
import { createBullet } from "@data/store/actors/bullet.actions"
import { increaseScore } from "@data/store/player"
import { clamp, ndelta, setMatrixAt } from "@data/utils"
import BossModel from "../models/BossModel"
import Muzzle, { MuzzleRef } from "../effects/Muzzle"
import useCollisionDetection from "@data/lib/useCollisionDetection"
import Counter from "@data/lib/Counter"

let size: Tuple3 = [4.5, 4.75, 2]

interface BossProps {
    startPosition: Tuple3
}

function explode(position: Vector3) {
    let ids: number[] = []

    for (let i = 0; i < 6; i++) {
        let basePosition = position.toArray()
        let delay = i * random.integer(200, 350)
        let explosionId = createExplosion({
            position: [
                basePosition[0] + random.float(-size[0] / 2, size[0] / 2),
                basePosition[1] + random.float(-size[1] / 2, 0),
                basePosition[2] + random.float(-size[2] / 2, size[2] / 2),
            ],
            radius: random.float(0.4, 0.6),
            count: 14,
            shockwave: false,
            delay,
        })
        let particlesId = createParticles({
            position: [
                basePosition[0] + random.float(-size[0] / 2, size[0] / 2),
                basePosition[1] + random.float((-size[1] / 2) * 0.5, (size[1] / 2) * 0.5),
                basePosition[2],
            ],
            offset: [[0, 0], [0, 0], [0, 0]],
            speed: [0, 25],
            spread: [[-1, 1], [0, 1]],
            normal: [random.float(-1, 1), 1, random.float(-1, 1)],
            count: [8, 14],
            radius: [0.1, 0.5],
            color: "#00f",
            delay: delay * 1.1,
        })

        ids.push(explosionId, particlesId)
    }

    let explosion2Id = createExplosion({
        position: [position.x, .5, position.z],
        radius: 0.7,
        count: 16,
        shockwave: true,
        delay: 800,
    })
    let explosion3Id = createExplosion({
        position: position.toArray(),
        radius: 0.7,
        count: 14,
        shockwave: true,
    })
    let explosion4Id = createExplosion({
        position: [position.x, 1, position.z],
        radius: 0.8,
        count: 20,
        fireballCount: 6,
        fireballPath: [[position.x, 0, position.z], [0, 8, 0]],
        shockwave: true,
        delay: 1300,
    })

    ids.push(explosion2Id, explosion3Id, explosion4Id)

    return ids
}

const HEAT_SEAKER_FREQUENCY = [1500, 3000, 2200, 2500, 2500]
const FIRE_FREQUENCY = [2100, 700, 1500, 3000]

interface Smoke {
    time: number
    radius: number
    lifetime: number
    position: Tuple3
    id: string
    index: number
}

const index = new Counter(100)
const geometry = new SphereGeometry(1, 16, 16)

export default function Boss({ startPosition: [startX, startY, startZ] }: BossProps) {
    let boss = useStore((i) => i.boss)
    let grid = useStore((i) => i.world.grid)
    let materials = useStore((i) => i.materials)
    let leftMuzzleRef = useRef<MuzzleRef>(null)
    let rightMuzzleRef = useRef<MuzzleRef>(null)
    let bossWrapper = useRef<Group>(null)
    let ref = useRef<InstancedMesh>(null)
    let data = useMemo(() => {
        return {
            dead: false,
            time: 0,
            nextHeatSeakerAt: Math.max(...HEAT_SEAKER_FREQUENCY),
            nextBulletAt: Math.max(...FIRE_FREQUENCY),
            acceleration: 0,
            velocity: 0,
            position: new Vector3(startX, startY, startZ),
            smoke: [] as Smoke[],
        }
    }, [startX, startY, startZ])
    let client = useMemo(() => {
        return grid.createClient([startX, startY, startZ], size, {
            type: "boss",
            id: "boss",
        })
    }, [grid, startX, startY, startZ])

    useCollisionDetection({
        client,
        bullet: ({ bullet, intersection, normal }) => {
            if (data.dead || bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damageBoss(5)) {
                increaseScore(50_000)
                increaseTrauma(1, data.position)
            } else {
                increaseScore(50)
            }

            createParticles({
                position: intersection,
                offset: [[0, 0], [0, 0], [0, 0]],
                speed: [3, 29],
                spread: [[0, 0], [0, 0]],
                normal,
                count: [0, 3],
                radius: [0.1, 0.3],
                color: "#00f",
            })
        },
    })

    useEffect(() => {
        let { state } = store.getState()

        if (boss?.health === 0 && !data.dead && state !== "gameover") {
            let ids = explode(data.position)
            let decalId = setTimeout(() => {
                startTransition(() => createImpactDecal([data.position.x, .1, data.position.z], 6))
            }, 900)
            let defeatId = setTimeout(() => startTransition(defeatBoss), 1200)

            ids.push(decalId, defeatId)
            data.dead = true
            grid.removeClient(client)

            return () => {
                ids.forEach((id) => clearTimeout(id))
            }
        }
    }, [boss?.health, client, data, grid])

    useEffect(() => {
        return () => grid.removeClient(client)
    }, [client, grid])

    // gravity
    useFrame((state, delta) => {
        let nd = ndelta(delta)
        let force = -15
        let element = bossWrapper.current
        let active = boss.health === 0

        if (active && element && element.position.y > size[1] * 0.3) {
            data.velocity += data.acceleration * nd
            data.acceleration += force * nd

            element.position.y += data.velocity * nd
            element.rotation.x += force * nd * .001
            element.rotation.y += force * nd * .0005
            element.rotation.z += force * nd * -.008
        }
    })

    // shooting
    useFrame((state, delta) => {
        if (boss.health === 0) {
            return
        }

        data.time += ndelta(delta) * 1000

        if (data.time >= data.nextHeatSeakerAt) {
            let side = random.pick(-1, 1)

            startTransition(() => {
                createHeatSeaker([
                    data.position.x + (size[0] / 2) * side,
                    data.position.y + 0.65,
                    data.position.z - 0.5,
                ])
                data.nextHeatSeakerAt = data.time + random.pick(...HEAT_SEAKER_FREQUENCY)
            })

            if (side === 1) {
                rightMuzzleRef.current?.activate()
            } else {
                leftMuzzleRef.current?.activate()
            }
        }

        if (data.time >= data.nextBulletAt) {
            let side = random.pick(-1, 1)

            startTransition(() => {
                createBullet({
                    position: [
                        data.position.x + (size[0] / 2) * side,
                        data.position.y + 0.65,
                        data.position.z - 2,
                    ],
                    color: "red",
                    speed: 25,
                    rotation: Math.PI * 0.5,
                    owner: Owner.ENEMY,
                })
                data.nextBulletAt = data.time + random.pick(...FIRE_FREQUENCY)
            })

            if (side === 1) {
                rightMuzzleRef.current?.activate()
            } else {
                leftMuzzleRef.current?.activate()
            }
        }
    })

    // movement
    useFrame((state) => {
        if (!bossWrapper.current) {
            return
        }

        if (boss.health > 0) {
            bossWrapper.current.position.y = size[1] / 2 + 1 + Math.sin(state.clock.elapsedTime * 0.97) * 0.85
            bossWrapper.current.position.x = Math.cos(state.clock.elapsedTime * 0.45) * 3 - 1
            bossWrapper.current.position.z = startZ - ((Math.sin(state.clock.elapsedTime * 0.6) + 1) / 2) * 3

            data.position.copy(bossWrapper.current.position)
            client.position = data.position.toArray()
            grid.updateClient(client)
        }
    })

    useFrame((state, delta) => {
        if (!ref.current) {
            return
        }

        let removed: string[] = []

        for (let smoke of data.smoke) {
            let t = 1 - clamp(smoke.time / smoke.lifetime, 0, 1)

            setMatrixAt({
                instance: ref.current,
                position: smoke.position,
                index: smoke.index,
                scale: smoke.radius * t
            })

            if (smoke.time > smoke.lifetime) {
                removed.push(smoke.id)
            }

            smoke.time += ndelta(delta) * 1000
        }

        data.smoke = data.smoke.filter((i) => !removed.includes(i.id))

    })

    return (
        <>
            {boss?.heatSeakers.map((i) => {
                return (
                    <HeatSeaker
                        key={i.id}
                        generateSmoke={(position: Tuple3) => {
                            data.smoke.push({
                                time: 0,
                                radius: random.float(0.125, 0.5),
                                position,
                                id: random.id(),
                                index: index.next(),
                                lifetime: random.integer(200, 450),
                            })
                        }}
                        {...i}
                    />
                )
            })}

            <instancedMesh
                castShadow
                receiveShadow
                frustumCulled={false}
                args={[geometry, materials.muzzle, 100]}
                ref={ref}
            />

            <BossModel
                ref={bossWrapper}
                destroyed={boss.health === 0}
            >
                <Muzzle
                    ref={leftMuzzleRef}
                    position={[-2.25, .5, -.75]}
                    rotation-y={Math.PI * .5}
                    decay={2}
                />
                <Muzzle
                    ref={rightMuzzleRef}
                    position={[2.25, .5, -.75]}
                    rotation-y={Math.PI * .5}
                    decay={2}
                />
            </BossModel>

            <DebugBox
                dynamic
                size={size}
                position={data.position}
                active={boss.state !== BossState.DEAD}
            />
        </>
    )
} 