import { useEffect, useMemo, useRef } from "react"
import { createHeatSeaker, damageBoss, registerBoss, removeBoss } from "../../../data/store/boss" 
import { Group, Vector3 } from "three"
import { useStore } from "../../../data/store"
import { Tuple3 } from "../../../types"
import { setLastImpactLocation } from "../../../data/store/player"
import HeatSeaker from "./HeatSeaker"
import { createExplosion, createParticles } from "../../../data/store/effects"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { createBullet } from "../../../data/store/actors"
import { Owner } from "../../../data/types"
import { useBulletCollision } from "../../../data/collisions"

let bossSize: Tuple3 = [4, 3, 2]

interface BossProps {
    startPosition: Tuple3
    pauseAt: number
}

export default function Boss({ pauseAt = 0, startPosition = [0, 0, 0] }: BossProps) {
    let boss = useStore(i => i.boss)
    let bossWrapper = useRef<Group>(null)
    let grid = useStore(i => i.world.grid)
    let data = useMemo(() => {
        return {
            dead: false,
            time: 0,
            nextHeatSeakerAt: 2000,
            nextBulletAt: 2000,
        }
    }, [])
    let position = useMemo(() => new Vector3(...startPosition), startPosition)
    let client = useMemo(() => {
        return grid.createClient([...startPosition], bossSize, {
            type: "boss",
            id: "boss", 
        })
    }, [grid, ...startPosition])

    useFrame((state, delta) => {
        data.time += delta * 1000

        if (data.time >= data.nextHeatSeakerAt) {
            createHeatSeaker(position.toArray())
            data.nextHeatSeakerAt = data.time + random.pick(1500, 700, 5000, 2500)
        }

        if (data.time >= data.nextBulletAt) {
            createBullet({
                position: [
                    position.x,
                    position.y,
                    position.z - 3
                ],
                damage: 10,
                color: "red",
                speed: 30,
                rotation: -Math.PI * .5,
                owner: Owner.ENEMY
            })
            data.nextBulletAt = data.time + random.pick(1100, 500, 200, 2000)
        }
    })

    useBulletCollision({
        name: "bulletcollision:boss",
        handler: ({ detail: { bullet, intersection, normal } }) => {
            if (data.dead || bullet.owner !== Owner.PLAYER) {
                return
            }

            damageBoss(10) 
            setLastImpactLocation(...intersection)
            createParticles({
                position: intersection,
                positionOffset: [[0, 0], [0, 0], [0, 0]],
                speed: [3, 29],
                speedOffset: [[0, 0], [0, 0], [0, 0]],
                normal,
                count: [0, 3],
                radius: [.1, .3],
                friction: [.8, .95],
                color: "#00f",
            }) 
        }
    })

    useEffect(() => {
        if (boss?.health === 0 && !data.dead) {
            data.dead = true

            for (let i = 0; i < 3; i++) {
                let basePosition = position.toArray()

                setTimeout(() => {
                    createExplosion({
                        position: [
                            basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            basePosition[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                            basePosition[2]
                        ],
                        radius: random.float(.5, .75),
                        count: 16,
                        shockwave: true,
                    })
                    createParticles({
                        position: [
                            basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            basePosition[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                            basePosition[2]
                        ],
                        positionOffset: [[0, 0], [0, 0], [0, 0]],
                        speed: [5, 30],
                        speedOffset: [[0, 0], [0, 0], [0, 0]],
                        normal: [random.float(-1, 1), 1, random.float(-1, 1)],
                        count: [14, 16],
                        radius: [.2, .6],
                        friction: [.8, .95],
                        color: "#00f",
                    })
                }, i * 350)
            }

            setTimeout(() => {
                createExplosion({
                    position: position.toArray(),
                    radius: random.float(1.3, 1.5),
                    count: 26,
                    shockwave: true,
                })
            }, 950)

            setTimeout(() => {
                removeBoss()
            }, 1200)
        }

    }, [boss?.health])

    useFrame((state) => {
        if (data.dead || !bossWrapper.current) {
            return
        }

        bossWrapper.current.position.x = Math.cos(state.clock.elapsedTime * .45) * 3.5
        bossWrapper.current.position.y = bossSize[1] / 2 + 1 + Math.sin(state.clock.elapsedTime * .97) * .85
        bossWrapper.current.position.z = startPosition[2] + Math.sin(state.clock.elapsedTime * .6) * 2

        position.copy(bossWrapper.current.position)
        client.position = position.toArray()
        grid.updateClient(client)
    })

    useEffect(() => {
        registerBoss({
            pauseAt, 
            position,
        })
    }, [])

    return (
        <>
            {boss?.heatSeakers.map(i => {
                return <HeatSeaker key={i.id} {...i} />
            })}

            <group
                ref={bossWrapper}
                visible={!!boss}
            >
                <mesh
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={bossSize} />
                    <meshLambertMaterial color="blue" />
                </mesh>
            </group>
        </>
    )
}