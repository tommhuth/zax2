import { startTransition, useEffect, useMemo, useRef } from "react"
import {
    createHeatSeaker,
    damageBoss,
    defeatBoss,
} from "../../../data/store/boss"
import { Group, Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { Tuple3 } from "../../../types.global"
import HeatSeaker from "./HeatSeaker"
import { createExplosion, createImpactDecal, createParticles } from "../../../data/store/effects"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { BossState, Owner } from "../../../data/types"
import { useCollisionDetection } from "../../../data/collisions"
import { useGLTF } from "@react-three/drei"
import bossModel from "@assets/models/boss.glb"
import bossdestroyedModel from "@assets/models/bossdestroyed.glb"
import DebugBox from "@components/DebugBox"
import { createBullet } from "@data/store/actors/bullet.actions"
import { useGravity } from "@data/hooks"
import { increaseScore } from "@data/store/player"

let bossSize: Tuple3 = [4.5, 4.75, 2]

interface BossProps {
    startPosition: Tuple3
}

// clean this up
export default function Boss({ startPosition = [0, 0, 0] }: BossProps) {
    let materials = useStore((i) => i.materials)
    let boss = useStore((i) => i.boss)
    let bossWrapper = useRef<Group>(null)
    let { nodes: boss2 } = useGLTF(bossdestroyedModel) as any
    let { nodes: boss1 } = useGLTF(bossModel) as any
    let grid = useStore((i) => i.world.grid)
    let data = useMemo(() => {
        return {
            dead: false,
            time: 0,
            nextHeatSeakerAt: 2000,
            nextBulletAt: 1500,
        }
    }, [])
    let position = useMemo(() => new Vector3(...startPosition), startPosition)
    let client = useMemo(() => {
        return grid.createClient([...startPosition], bossSize, {
            type: "boss",
            id: "boss",
        })
    }, [grid, ...startPosition])

    useGravity({
        ref: bossWrapper,
        stopAt: bossSize[1] * 0.3,
        active: boss.health === 0,
    })

    useCollisionDetection({
        client,
        bullet: ({ bullet, intersection, normal }) => {
            if (data.dead || bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damageBoss(5)) {
                increaseScore(50_000)
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
        if (boss?.health === 0 && !data.dead) {
            data.dead = true
            grid.removeClient(client)

            startTransition(() => {
                for (let i = 0; i < 6; i++) {
                    let basePosition = position.toArray()
                    let delay = i * random.integer(200, 350)

                    createExplosion({
                        position: [
                            basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            basePosition[1] + random.float(-bossSize[1] / 2, 0),
                            basePosition[2] + random.float(-bossSize[2] / 2, bossSize[2] / 2),
                        ],
                        radius: random.float(0.4, 0.6),
                        count: 14,
                        shockwave: false,
                        delay,
                    })
                    createParticles({
                        position: [
                            basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            basePosition[1] + random.float((-bossSize[1] / 2) * 0.5, (bossSize[1] / 2) * 0.5),
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
                }

                createExplosion({
                    position: [position.x, .5, position.z],
                    radius: 0.7,
                    count: 16,
                    shockwave: true,
                    delay: 800,
                })

                createExplosion({
                    position: position.toArray(),
                    radius: 0.7,
                    count: 14,
                    shockwave: true,
                })

                createExplosion({
                    position: [position.x, 1, position.z],
                    radius: 0.8,
                    count: 20,
                    fireballCount: 6,
                    fireballPath: [[position.x, 0, position.z], [0, 8, 0]],
                    shockwave: true,
                    delay: 1300,
                })

                setTimeout(() => createImpactDecal([position.x, .1, position.z], 6), 900)
                setTimeout(() => defeatBoss(), 1200)
            })
        }
    }, [boss?.health])

    useEffect(() => {
        return () => grid.removeClient(client)
    }, [client, grid])

    // shooting
    useFrame((state, delta) => {
        if (boss.health === 0) {
            return
        }

        let { effects } = store.getState()

        data.time += delta * 1000

        if (data.time >= data.nextHeatSeakerAt) {
            startTransition(() => {
                createHeatSeaker([
                    position.x + (bossSize[0] / 2) * random.pick(-1, 1) * 1,
                    position.y + 0.65,
                    position.z - 0.5,
                ])
                data.nextHeatSeakerAt = data.time + random.pick(1500, 700, 250, 400) * (1 / effects.timeScale)
            })
        }

        if (data.time >= data.nextBulletAt) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x + (bossSize[0] / 2) * random.pick(-1, 1) * 1,
                        position.y + 0.65,
                        position.z - 2,
                    ],
                    color: "red",
                    speed: 25,
                    rotation: -Math.PI * 0.5,
                    owner: Owner.ENEMY,
                })
                data.nextBulletAt = data.time + random.pick(1100, 500, 250) * (1 / effects.timeScale)
            })
        }
    })

    useFrame((state) => {
        if (!bossWrapper.current) {
            return
        }

        if (boss.health > 0) {
            bossWrapper.current.position.y = bossSize[1] / 2 + 1 + Math.sin(state.clock.elapsedTime * 0.97) * 0.85
            bossWrapper.current.position.x = Math.cos(state.clock.elapsedTime * 0.45) * 3 - 1
            bossWrapper.current.position.z = startPosition[2] - ((Math.sin(state.clock.elapsedTime * 0.6) + 1) / 2) * 3

            position.copy(bossWrapper.current.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    return (
        <>
            <DebugBox
                dynamic
                size={bossSize}
                position={position}
                active={boss.state !== BossState.DEAD}
            />

            {boss?.heatSeakers.map((i) => {
                return (
                    <HeatSeaker
                        key={i.id}
                        {...i}
                    />
                )
            })}

            <group ref={bossWrapper}>
                <group
                    dispose={null}
                    visible={boss.health === 0}
                >
                    <mesh
                        receiveShadow
                        geometry={boss2.Cube001.geometry}
                        material={materials.bossLightBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={boss2.Cube001_1.geometry}
                        material={materials.bossBlack}
                    />
                    <mesh
                        receiveShadow
                        geometry={boss2.Cube001_2.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={boss2.Cube001_3.geometry}
                        material={materials.bossBlue}
                    />
                    <mesh
                        receiveShadow
                        geometry={boss2.Cube001_4.geometry}
                        material={materials.bossSecondaryBlue}
                    />
                </group>

                <group
                    dispose={null}
                    visible={boss.health > 0}
                >
                    <mesh
                        geometry={boss1.Cube012.geometry}
                        material={materials.bossLightBlue}
                    />
                    <mesh
                        geometry={boss1.Cube012_1.geometry}
                        material={materials.bossBlack}
                    />
                    <mesh
                        geometry={boss1.Cube012_2.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        castShadow
                        geometry={boss1.Cube012_3.geometry}
                        material={materials.bossBlue}
                    />
                    <mesh
                        geometry={boss1.Cube012_4.geometry}
                        material={materials.bossSecondaryBlue}
                    />
                    <mesh
                        geometry={boss1.Cube012_5.geometry}
                        material={materials.bossWhite}
                    />
                </group>
            </group>
        </>
    )
} 