import { useFrame, useLoader } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AdditiveBlending, Group, PointLight, TextureLoader, Vector3 } from "three"
import { GLTFModel, Tuple3 } from "../types.global"
import { clamp, ndelta } from "../data/utils"
import { BossState, Owner } from "../data/types"
import animate from "@huth/animate"
import { store, useStore } from "../data/store"
import { damagePlayer, setPlayerObject } from "../data/store/player"
import { playerColor } from "../data/theme"
import { MeshRetroMaterial } from "./world/materials/MeshRetroMaterial"
import { removeHeatSeaker, setBossProp } from "../data/store/boss"
import { useCollisionDetection } from "../data/collisions"
import { easeInOutCubic, easeInQuad, easeOutExpo } from "../data/shaping"
import Exhaust from "./Exhaust"
import { damp } from "three/src/math/MathUtils.js"
import { BULLET_SIZE, EDGE_MAX, EDGE_MIN, WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "../data/const"
import { uiTunnel } from "../components/ui/tunnels"

import playerModel from "@assets/models/player.glb"
import { useGLTF } from "@react-three/drei"
import DebugBox from "./DebugBox"
import { createExplosion, createParticles, setTimeScale } from "@data/store/effects"
import random from "@huth/random"
import { createBullet } from "@data/store/actors/bullet.actions"
import { damagePlane } from "@data/store/actors/plane.actions"
import { damageRocket } from "@data/store/actors/rocket.actions"
import { damageTurret } from "@data/store/actors/turret.actions"
import { damageBarrel } from "@data/store/actors/barrel.actions"

let depth = 3

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

interface LocalData {
    nextShotAt: number
    isMovingUp: boolean
    bossDeadAt: number
}

export default function Player({
    size = [1.5, 1, depth],
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
    let [position, targetPosition] = useStore(i => [i.player.position, i.player.targetPosition])
    let [health, speed] = useStore(i => [i.player.health, i.player.speed])
    let [dead, setDead] = useState(false)
    let controls = useStore(i => i.controls)
    let diagonal = useStore(i => i.world.diagonal)
    let engineLightRef = useRef<PointLight>(null)
    let { nodes } = useGLTF(playerModel) as GLTFModel<["player"]>
    let glow = useLoader(TextureLoader, "/textures/glow.png")
    let client = useMemo(() => {
        return grid.createClient([0, 0, z], size, {
            type: "player",
            id: "player",
        })
    }, [grid])
    let data = useMemo<LocalData>(() => {
        return {
            nextShotAt: 0,
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
        if (health === 0) {
            setDead(true)
            animate({
                from: 1,
                to: .2,
                duration: 1500,
                easing: easeInOutCubic,
                render(timeScale) {
                    setTimeScale(timeScale)
                }
            })

            for (let i = 0; i < 9; i++) {
                createExplosion({
                    position: position.toArray(),
                    count: random.integer(6, 8),
                    delay: i * 400,
                    shockwave: i === 7,
                    blastRadius: i % 3 === 0 ? random.float(3, 5) : 0
                })
                createParticles({
                    position: position.toArray(),
                    offset: [
                        [-size[0] / 2, size[0] / 2],
                        [-size[1] / 2, size[1] / 2],
                        [-size[2] / 2, size[2] / 2]
                    ],
                    count: random.integer(8, 16),
                    radius: [.05, .3],
                    stagger: [0, 100],
                    restitution: [.4, .85],
                    normal: [random.float(-1, 1), 1, -1],
                    delay: i * 650,
                    color: ["#88F", "#00f", "#007", "#249", "#09F"]
                })
            }

        }
    }, [health])

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
        client,
        active: () => !dead,
        bullet: ({ bullet }) => {
            if (bullet.owner === Owner.ENEMY) {
                damagePlayer(5)
            }
        },
        obstacle: () => {
            damagePlayer(100)
        },
        turret: (data) => {
            damageTurret(data.id, 100)
            damagePlayer(100)
        },
        barrel: (data) => {
            damageBarrel(data.id, 100)
            damagePlayer(20)
        },
        plane: (data) => {
            damagePlane(data.id, 100)
            damagePlayer(50)
        },
        rocket: (data) => {
            damageRocket(data.id, 100)
            damagePlayer(50)
        },
        heatSeaker: (data) => {
            removeHeatSeaker(data.id)
            damagePlayer(25)
        },
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
        if (Date.now() > data.nextShotAt && controls.keys.space && setup) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x,
                        position.y,
                        position.z + (depth / 2 + BULLET_SIZE[2] / 2) * 1.5
                    ],
                    owner: Owner.PLAYER,
                    rotation: Math.PI * .5,
                    speed: weapon.speed,
                    color: "#fff",
                })
                data.nextShotAt = Date.now() + weapon.fireFrequency * (1 / store.getState().effects.timeScale)
            })
        }
    })

    // movement
    useFrame((state, delta) => {
        let { ready, boss, player } = useStore.getState()

        if (playerGroupRef.current && ready) {
            let nd = ndelta(delta)
            let group = playerGroupRef.current
            let y = clamp(targetPosition.y, EDGE_MIN.y, EDGE_MAX.y)
            let move = (speed: number) => {
                if (dead) {
                    return
                }

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
                <DebugBox active size={size} position={new Vector3()} />
                <group
                    ref={innerRef}
                >
                    <mesh
                        receiveShadow
                        castShadow
                        position={[0, 0, 0]}
                        visible={!dead}
                    >
                        <MeshRetroMaterial
                            name="player"
                            attach={"material"}
                            color={playerColor}
                            colorCount={3}
                        />
                        <primitive object={nodes.player.geometry} attach="geometry" />
                    </mesh>

                    <mesh
                        scale={[3.5, 6, 1]}
                        rotation-x={-Math.PI * .5}
                        position={[0, -.25, -.7]}
                        visible={!dead}
                    >
                        <planeGeometry args={[1, 1, 1, 1]} />
                        <meshBasicMaterial
                            map={glow}
                            transparent
                            depthWrite={false}
                            opacity={.35}
                            blending={AdditiveBlending}
                        />
                    </mesh>

                    <Exhaust
                        offset={[0, -.15, -3.35]}
                        scale={[.5, .3, 1.6]}
                        visible={!dead}
                    />

                    <pointLight
                        ref={engineLightRef}
                        distance={80}
                        position={[0, .1, -1.75]}
                        intensity={dead ? 0 : 80}
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
                    {health.toFixed(0)}%

                    <div ref={scoreRef} />
                </div>
            </uiTunnel.In>
        </>
    )
}