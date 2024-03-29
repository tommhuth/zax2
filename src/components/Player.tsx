import { useFrame, useLoader } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { AdditiveBlending, Group, PointLight, TextureLoader } from "three"
import { Tuple3 } from "../types" 
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { clamp, ndelta } from "../data/utils"
import { BossState, Owner } from "../data/types"
import {  store, useStore } from "../data/store"
import { damagePlayer, increaseScore, setPlayerObject } from "../data/store/player"
import { createBullet, damagePlane, damageRocket, damageTurret } from "../data/store/actors"
import { damageBarrel } from "../data/store/world"
import { playerColor } from "../data/theme"
import { MeshRetroMaterial } from "./world/materials/MeshRetroMaterial"
import { removeHeatSeaker, setBossProp } from "../data/store/boss"
import { useCollisionDetection } from "../data/collisions"
import { easeInQuad } from "../data/shaping"
import Exhaust from "./Exhaust"
import { damp } from "three/src/math/MathUtils.js"
import { BULLET_SIZE, EDGE_MAX, EDGE_MIN, WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "../data/const"

let depth = 2

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

interface LocalData {
    lastShotAt: number
    isMovingUp: boolean
    bossDeadAt: number
    speed: number
}

export default function Player({
    size = [1.5, .5, depth],
    z = 0,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let grid = useStore(i => i.world.grid)
    let weapon = useStore(i => i.player.weapon)
    let setup = useStore(i => i.setup)
    let state = useStore(i => i.state)
    let bossState = useStore(i => i.boss.state)
    let position = useStore(i => i.player.position)
    let targetPosition = useStore(i => i.player.targetPosition)
    let controls = useStore(i => i.controls)
    let engineLightRef = useRef<PointLight>(null)
    let model = useLoader(GLTFLoader, "/models/player.glb")
    let text = useLoader(TextureLoader, "/textures/glow.png")
    let client = useMemo(() => {
        return grid.createClient([0, 0, z], size, {
            type: "player",
            id: "player",
        })
    }, [grid])
    let data = useMemo<LocalData>(() => {
        return {
            speed: 6,
            lastShotAt: 0,
            isMovingUp: false,
            bossDeadAt: 0,
        }
    }, [])
    let handleRef = useCallback((object: Group) => {
        if (!object) {
            return
        }

        playerGroupRef.current = object
        setPlayerObject(object)
    }, [])

    useEffect(() => {
        if (playerGroupRef.current) {
            playerGroupRef.current.position.x = WORLD_CENTER_X
            playerGroupRef.current.position.y = y
            playerGroupRef.current.position.z = z
        }
    }, [])

    useEffect(() => {
        if (bossState === BossState.DEAD) {
            data.bossDeadAt = Date.now()
        }
    }, [bossState])

    useCollisionDetection({
        interval: 1,
        size,
        position,
        actions: {
            bullet: ({ bullet, type }) => {
                if (bullet.owner !== Owner.PLAYER || type !== "player") {
                    return
                }

                damagePlayer(bullet.damage)
                increaseScore(-10)
            },
            building: () => {
                damagePlayer(100)
            },
            turret: (data) => {
                damagePlayer(100)
                damageTurret(data.id, 100)
            },
            barrel: (data) => {
                damageBarrel(data.id, 100)
            },
            plane: (data) => {
                damagePlayer(100)
                damagePlane(data.id, 100)
            },
            rocket: (data) => {
                damagePlayer(100)
                damageRocket(data.id, 100)
            },
            heatseaker: (data) => {
                damagePlayer(30)
                removeHeatSeaker(data.id)
            },
            boss: () => {
                damagePlayer(100)
            }
        }
    })

    // init player ready position
    useLayoutEffect(() => {
        if (setup && playerGroupRef.current) {
            playerGroupRef.current.position.z = WORLD_PLAYER_START_Z
        }
    }, [setup])

    // input
    useFrame((state, delta) => {
        let speedx = 12
        let speedy = 10
        let nd = ndelta(delta)

        if (Object.entries(controls.keys).length) {
            if (controls.keys.a) {
                targetPosition.x += speedx * nd
            } else if (controls.keys.d) {
                targetPosition.x -= speedx * nd
            }

            if (controls.keys.w) {
                targetPosition.y += speedy * nd
            } else if (controls.keys.s) {
                targetPosition.y -= speedy * nd
            }

            targetPosition.clamp(EDGE_MIN, EDGE_MAX)
        }
    })

    // shoot
    useFrame(() => {
        if (Date.now() - data.lastShotAt > weapon.fireFrequency && controls.keys.space && setup) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x,
                        position.y,
                        position.z + (depth / 2 + BULLET_SIZE[2] / 2) * 1.5
                    ],
                    owner: Owner.PLAYER,
                    damage: weapon.damage,
                    rotation: Math.PI * .5,
                    speed: weapon.speed,
                    color: "#fff",
                })
                data.lastShotAt = Date.now()
            })
        }
    })

    // movement
    useFrame((state, delta) => {
        let { ready } = useStore.getState()

        if (playerGroupRef.current && ready) {
            let nd = ndelta(delta)
            let group = playerGroupRef.current
            let y = clamp(targetPosition.y, EDGE_MIN.y, EDGE_MAX.y)
            let { boss, player } = store.getState()
            let move = (speed: number) => {
                group.position.x = damp(group.position.x, targetPosition.x, 4, nd)
                group.position.y = damp(group.position.y, y, 5, nd)
                group.position.z += speed * nd

                group.rotation.z = (targetPosition.x - group.position.x) * -.15
                group.rotation.x = (targetPosition.y - group.position.y) * -.1

                player.velocity.z = clamp((speed * nd) / (data.speed * nd), 0, 1)
            }

            if (boss.state === BossState.IDLE) {
                let t = 1 - clamp((group.position.z - boss.pauseAt - 3) / 3, 0, 1)

                move(data.speed * t)

                if (t < .5) {
                    startTransition(() => setBossProp("state", BossState.ACTIVE))
                }
            } else if (boss.state === BossState.ACTIVE) {
                move(0)
            } else if (boss.state === BossState.DEAD) {
                let t = easeInQuad(clamp((Date.now() - data.bossDeadAt) / 2400, 0, 1))

                move(data.speed * t)
            } else {
                move(data.speed)
            }

            position.copy(group.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    return (
        <>
            <group
                ref={handleRef}
                visible={setup ? state !== "intro" : true}
            >
                <primitive
                    object={model.nodes.player}
                    receiveShadow
                    castShadow
                    position={[0, 0, 0]}
                >
                    <MeshRetroMaterial
                        name="player"
                        attach={"material"}
                        color={playerColor}
                    />
                </primitive>

                <mesh
                    scale={[3.5,6,1]} 
                    rotation-x={-Math.PI * .5} 
                    position={[0, -.25, -.7]}
                >
                    <planeGeometry args={[1,1,1,1]} />
                    <meshBasicMaterial 
                        map={text} 
                        transparent 
                        depthWrite={false}
                        opacity={.35} 
                        blending={AdditiveBlending}
                    />
                </mesh> 

                <Exhaust
                    offset={[0, -.15, -3.35]}
                    scale={[.5, .3, 1.6]}
                />

                <pointLight
                    ref={engineLightRef}
                    distance={90}
                    position={[0, .1, -1.75]}
                    intensity={50}
                    color={"#ffffff"}
                />
            </group>
        </>
    )
}