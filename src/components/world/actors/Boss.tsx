import { useEffect, useMemo, useRef } from "react"
import { createHeatSeaker, damageBoss, defeatBoss } from "../../../data/store/boss"
import { Group, Vector3 } from "three"
import { useStore } from "../../../data/store"
import { Tuple3 } from "../../../types" 
import HeatSeaker from "./HeatSeaker"
import { createExplosion, createParticles } from "../../../data/store/effects"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { createBullet } from "../../../data/store/actors"
import { Owner } from "../../../data/types"
import { useCollisionDetection } from "../../../data/collisions"
import { useGLTF } from "@react-three/drei"

let bossSize: Tuple3 = [4.5, 4.75, 2]

interface BossProps {
    startPosition: Tuple3 
}

export default function Boss({ startPosition = [0, 0, 0] }: BossProps) {
    let materials = useStore(i => i.materials)
    let boss = useStore(i => i.boss)
    let bossWrapper = useRef<Group>(null)
    let { nodes } = useGLTF("/models/boss.glb") as any
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
        if (boss.health === 0) {
            return 
        }

        data.time += delta * 1000

        if (data.time >= data.nextHeatSeakerAt) {
            createHeatSeaker([
                position.x + bossSize[0] / 2 * random.pick(-1, 1) * 1,
                position.y + .65,
                position.z - .5
            ])
            data.nextHeatSeakerAt = data.time + random.pick(1500, 700, 5000, 2500)
        }

        if (data.time >= data.nextBulletAt) {
            createBullet({
                position: [
                    position.x + bossSize[0] / 2 * random.pick(-1, 1) * 1,
                    position.y + .65,
                    position.z - 2
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
 
    useCollisionDetection({
        actions: {
            bullet: ({ bullet, intersection, normal, type }) => {
                if (data.dead || bullet.owner !== Owner.PLAYER || type !== "boss") {
                    return
                }
    
                damageBoss(10) 
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
        }
    })

    useEffect(() => {
        if (boss?.health === 0 && !data.dead) {
            data.dead = true 

            for (let i = 0; i < 3; i++) {
                let basePosition = position.toArray() 
                let p = [
                    basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                    basePosition[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                    basePosition[2]
                ]

                createExplosion({
                    position: p,
                    radius: random.float(.5, .75),
                    fireballCount: 6,
                    fireballPath: [p,  [-1,1,-5]],
                    count: 16,
                    shockwave: true,
                    delay: i * 350
                })
                createParticles({
                    position: [
                        basePosition[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                        basePosition[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                        basePosition[2]
                    ],
                    positionOffset: [[0, 0], [0, 0], [0, 0]],
                    speed: [-20 , 20],

                    speedOffset: [[0, 0], [0, 0], [0, 0]],
                    normal: [random.float(-1, 1), 1, random.float(-1, 1)],
                    count: [14, 16],
                    radius: [.2, .6],
                    friction: [.7, .8],
                    color: "#00f",
                    delay: i * 500
                })
            }

            createExplosion({
                position: position.toArray(),
                radius: 1.3,
                count: 26,
                shockwave: true,
                delay: 950
            })

            setTimeout(() => defeatBoss() , 1200)
        }

    }, [boss?.health])

    useFrame((state) => {
        if (data.dead || !bossWrapper.current) {
            return
        }

        bossWrapper.current.position.x = Math.cos(state.clock.elapsedTime * .45) * 3.5
        bossWrapper.current.position.y = bossSize[1] / 2 + 1 + Math.sin(state.clock.elapsedTime * .97) * .85
        bossWrapper.current.position.z = startPosition[2] - ((Math.sin(state.clock.elapsedTime * .6) + 1) / 2) * 6

        position.copy(bossWrapper.current.position)
        client.position = position.toArray()
        grid.updateClient(client)
    }) 

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
                    geometry={nodes.Cube012.geometry}
                    material={materials.bossLightBlue}
                />
                <mesh
                    geometry={nodes.Cube012_1.geometry}
                    material={materials.bossBlack}
                />
                <mesh
                    geometry={nodes.Cube012_2.geometry}
                    material={materials.bossDarkBlue}
                />
                <mesh
                    castShadow
                    geometry={nodes.Cube012_3.geometry}
                    material={materials.bossBlue}
                />
                <mesh
                    geometry={nodes.Cube012_4.geometry}
                    material={materials.bossSecondaryBlue}
                />
                <mesh
                    geometry={nodes.Cube012_5.geometry}
                    material={materials.bossWhite}
                />
            </group>
        </>
    )
}

useGLTF.preload("/models/boss.glb")