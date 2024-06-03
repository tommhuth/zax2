import { useFrame, useLoader } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { AdditiveBlending, Group, PointLight, TextureLoader } from "three"
import { Tuple3 } from "../types"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { clamp, ndelta } from "../data/utils"
import { BossState, Owner } from "../data/types"
import animate from "@huth/animate"
import { store, useStore } from "../data/store"
import { damagePlayer, increaseScore, setPlayerObject } from "../data/store/player"
import { createBullet, damagePlane, damageRocket, damageTurret } from "../data/store/actors"
import { damageBarrel } from "../data/store/world"
import { playerColor } from "../data/theme"
import { MeshRetroMaterial } from "./world/materials/MeshRetroMaterial"
import { removeHeatSeaker, setBossProp } from "../data/store/boss"
import { useCollisionDetection } from "../data/collisions"
import { easeInQuad, easeOutExpo } from "../data/shaping"
import Exhaust from "./Exhaust"
import { damp } from "three/src/math/MathUtils.js"
import { BULLET_SIZE, EDGE_MAX, EDGE_MIN, WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "../data/const"
import { uiTunnel } from "../components/ui/tunnels"

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
}

export default function Player({
    size = [1.5, .5, depth],
    z = 0,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let scoreRef = useRef<HTMLDivElement>(null)
    let grid = useStore(i => i.world.grid)
    let weapon = useStore(i => i.player.weapon)
    let ready = useStore(i => i.ready)
    let setup = useStore(i => i.setup)
    let innerRef = useRef<Group>(null)
    let bossState = useStore(i => i.boss.state)
    let position = useStore(i => i.player.position)
    let player = useStore(i => i.player)
    let speed = useStore(i => i.player.speed)
    let targetPosition = useStore(i => i.player.targetPosition)
    let controls = useStore(i => i.controls)
    let diagonal = useStore(i => i.world.diagonal)
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
        client,
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

    useEffect(() => {
        return useStore.subscribe((state) => {
            if (!scoreRef.current) {
                return
            }

            scoreRef.current.innerText = state.player.score.toLocaleString("en")
        })
    }, [])

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

                player.velocity.z = clamp((speed * nd) / (speed * nd), 0, 1)
            }

            if (boss.state === BossState.IDLE) {
                let t = 1 - clamp((group.position.z - boss.pauseAt - 3) / 3, 0, 1)

                move(speed * t)

                if (t < .5) {
                    startTransition(() => setBossProp("state", BossState.ACTIVE))
                }
            } else if (boss.state === BossState.ACTIVE) {
                move(0)
            } else if (boss.state === BossState.DEAD) {
                let t = easeInQuad(clamp((Date.now() - data.bossDeadAt) / 2400, 0, 1))

                move(speed * t)
            } else {
                move(speed)
            }

            position.copy(group.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    useLayoutEffect(() => {
        if (!innerRef.current) {
            return
        }

        innerRef.current.position.z = -diagonal

        if (ready) {
            return animate({
                from: -diagonal,
                to: 0,
                easing: easeOutExpo,
                duration: 4000,
                delay: 2000,
                render(z) {
                    if (!innerRef.current) {
                        return
                    }

                    innerRef.current.position.z = z
                },
            })
        }
    }, [ready, diagonal])

    return (
        <>
            <group
                ref={handleRef}
            >
                <group ref={innerRef}>
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
                            colorCount={3}
                        />
                    </primitive>

                    <mesh
                        scale={[3.5, 6, 1]}
                        rotation-x={-Math.PI * .5}
                        position={[0, -.25, -.7]}
                    >
                        <planeGeometry args={[1, 1, 1, 1]} />
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
                        distance={140}
                        position={[0, .1, -1.75]}
                        intensity={160}
                        color={"#ffffff"}
                    />
                </group>
            </group>

            <uiTunnel.In>
                <div
                    className="player-ui"
                    key="player"
                    style={{
                        opacity: !ready ? 0 : 1,
                        marginBottom: ready ? 0 : "-1em",
                    }}
                >
                    {player.health.toFixed(0)}%

                    <div ref={scoreRef} />
                </div>
            </uiTunnel.In>
        </>
    )
}