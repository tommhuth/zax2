import { useFrame, useLoader } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useMemo, useRef } from "react"
import { BufferGeometry, Group, Material, Mesh, Vector3 } from "three"
import { Tuple3 } from "../types"
import { WORLD_BOTTOM_EDGE, WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "./world/World"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { clamp, ndelta } from "../data/utils"
import { useWindowEvent } from "../data/hooks"
import { BossState, Owner } from "../data/types"
import { bulletSize, store, useStore } from "../data/store"
import { damagePlayer, increaseScore, setPlayerObject } from "../data/store/player"
import { createBullet, damagePlane, damageRocket, damageTurret } from "../data/store/actors"
import { damageBarrel } from "../data/store/world"
import { playerColor } from "../data/theme"
import { MeshRetroMaterial } from "./world/MeshRetroMaterial"
import { removeHeatSeaker, setBossProp } from "../data/store/boss"
import { useBulletCollision, useCollisionDetection } from "../data/collisions"
import random from "@huth/random"
import { easeInQuad } from "../data/shaping"

let _edgemin = new Vector3(WORLD_RIGHT_EDGE, WORLD_BOTTOM_EDGE, -100)
let _edgemax = new Vector3(WORLD_LEFT_EDGE, WORLD_TOP_EDGE, 100)

let depth = 2

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

interface LocalData {
    lastShotAt: number
    isMovingUp: boolean
    keys: Record<string, boolean>
    bossDeadAt: number
    position: Vector3
    currentPointerPosition: Vector3
    originalPointerPosition: Vector3
    targetPosition:Vector3 
}

export default function Player({
    size = [1.5, .5, depth],
    z = -15,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let flameRef = useRef<Mesh<BufferGeometry, Material> | null>(null)
    let hitboxRef = useRef<Mesh>(null) 
    let grid = useStore(i => i.world.grid) 
    let weapon = useStore(i => i.player.weapon)
    let ready = useStore(i => i.ready)
    let state = useStore(i => i.state)
    let bossState = useStore(i => i.boss.state) 
    let models = useLoader(GLTFLoader, "/models/space.glb") 
    let client = useMemo(() => {
        return grid.createClient([0, 0, z], size, {
            type: "player",
            id: "player",
        })
    }, [grid]) 
    let speed = 6 
    let data = useMemo<LocalData>(()=> {
        return {
            lastShotAt: 0,
            isMovingUp: false,
            keys: {},
            bossDeadAt: Infinity, 
            position: new Vector3(0, y, z),
            currentPointerPosition: new Vector3(),
            originalPointerPosition: new Vector3(),
            targetPosition: new Vector3(WORLD_CENTER_X, _edgemin.y, z)
        }
    }, []) 

    useEffect(()=> {
        if (bossState === BossState.DEAD) { 
            data.bossDeadAt = Date.now()
        }
    }, [bossState])

    let handleRef = useCallback((object: Group) => {
        if (!object) {
            return
        }

        playerGroupRef.current = object
        setPlayerObject(object)
    }, []) 

    useWindowEvent("keydown", (e: KeyboardEvent) => {
        data.keys[e.code] = true
    })

    useWindowEvent("keyup", (e: KeyboardEvent) => {
        delete data.keys[e.code]
    })

    useBulletCollision({
        name: "bulletcollision:player",
        handler: ({ detail: { bullet } }) => {
            if (bullet.owner !== Owner.PLAYER) {
                return
            }

            damagePlayer(bullet.damage)
            increaseScore(-10)
        }
    })

    useCollisionDetection({
        interval: 1,
        source: {
            size,
            position: data.position,
        },
        actions: {
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
                damagePlayer(25)
                removeHeatSeaker(data.id)
            },
            boss: () => {
                damagePlayer(100)
            }
        }
    })

    useEffect(() => {
        if (ready && playerGroupRef.current) {
            playerGroupRef.current.position.z = 80
        }
    }, [ready])

    useEffect(() => {
        let shootDiv = document.getElementById("shoot") as HTMLElement
        // shoot 
        let onTouchStartShoot = () => {
            data.keys.Space = true
        }
        let onTouchEndShoot = () => {
            delete data.keys.Space
        }

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            shootDiv.removeEventListener("touchstart", onTouchStartShoot)
            shootDiv.removeEventListener("touchend", onTouchEndShoot)
            shootDiv.removeEventListener("touchcancel", onTouchEndShoot)
        }
    }, [])

    // input
    useFrame((state, delta) => {
        let speedx = 12
        let speedy = 10
        let nd = ndelta(delta)

        if (Object.entries(data.keys).length) {
            if (data.keys.KeyA) {
                data.targetPosition.x += speedx * nd
            } else if (data.keys.KeyD) {
                data.targetPosition.x -= speedx * nd
            }

            if (data.keys.KeyW) {
                data.targetPosition.y += speedy * nd
            } else if (data.keys.KeyS) {
                data.targetPosition.y -= speedy * nd
            }

            data.targetPosition.clamp(_edgemin, _edgemax)
        }
    })

    // shoot
    useFrame(() => {
        if (Date.now() - data.lastShotAt > weapon.fireFrequency && data.keys.Space) {
            startTransition(() => {
                createBullet({
                    position: [
                        data.position.x,
                        data.position.y,
                        data.position.z + (depth / 2 + bulletSize[2] / 2) * 1.5
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

    useEffect(() => {
        if (playerGroupRef.current) {
            playerGroupRef.current.position.x = WORLD_CENTER_X
            playerGroupRef.current.position.y = y
            playerGroupRef.current.position.z = z
        }
    }, [])

    // movement
    useFrame((state, delta) => {
        if (playerGroupRef.current && hitboxRef.current) {
            let nd = ndelta(delta)
            let playerGroup = playerGroupRef.current
            let y = clamp(data.targetPosition.y, _edgemin.y, _edgemax.y)
            let { boss } = store.getState()
            let move = (speed: number) => {
                playerGroup.position.z += speed * nd
                data.currentPointerPosition.z += speed * nd 
                playerGroup.position.x += (data.targetPosition.x - playerGroup.position.x) * (.09 * 60 * nd)
                playerGroup.position.y += (y - playerGroup.position.y) * (.08 * 60 * nd) 
            }

            if (boss.state === BossState.IDLE) {
                let d = 1 - clamp((playerGroup.position.z - boss.pauseAt - 3) / 3, 0, 1)

                move(speed * d)

                if (d < .1) {
                    setBossProp("state", BossState.ACTIVE)
                }
            } else if (boss.state === BossState.ACTIVE) { 
                move(0)
            } else if (boss.state === BossState.DEAD) {
                let d = easeInQuad(clamp((Date.now() - data.bossDeadAt) / 1400, 0, 1))  

                move(speed * d)
            }else {
                move(speed )
            }

            hitboxRef.current.position.z = playerGroup.position.z

            data.position.copy(playerGroup.position)
            client.position = data.position.toArray()
            grid.updateClient(client)
        }
    })

    useFrame(() => {
        if (flameRef.current) {
            flameRef.current.scale.x = random.float(.3, .6)
            flameRef.current.scale.z = random.float(.9, 1.1)
            flameRef.current.position.z = -flameRef.current.scale.z - 1
            flameRef.current.material.opacity = random.float(.85, 1)
        }
    })

    return (
        <>
            <group
                ref={handleRef}
                scale={.75}
                visible={state !== "intro"}
            >
                <primitive
                    object={models.nodes.plane}
                    receiveShadow
                    castShadow
                    position={[0, 0, 0]}
                >
                    <MeshRetroMaterial
                        dithering={false}
                        isInstance={false}
                        name="player"
                        attach={"material"}
                        color={playerColor}
                    />
                </primitive>
                <mesh visible={false}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial color="red" wireframe name="debug" />
                </mesh>
                <mesh
                    scale={[.5, .21, 1]}
                    ref={flameRef}
                    position-z={-2}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color="white" transparent name="solidWhite" />
                </mesh>
            </group>
            <mesh
                ref={hitboxRef}
                position={[0, .1, 0]}
                visible={false}
                rotation-x={-Math.PI / 2}
                onPointerUp={() => {
                    data.isMovingUp = false
                }}
                onPointerMove={({ pointerType, point }) => {
                    if (pointerType === "touch") {
                        let depthThreshold = 2

                        if (Math.abs(data.originalPointerPosition.z - point.z) > depthThreshold) {
                            data.isMovingUp = true
                        }

                        if (data.isMovingUp) {
                            data.targetPosition.y += (point.z - data.currentPointerPosition.z)
                        }

                        data.targetPosition.x += (point.x - data.currentPointerPosition.x) * 1.5
                        data.targetPosition.clamp(_edgemin, _edgemax)
                        data.currentPointerPosition.copy(point)
                    }
                }}
                onPointerDown={(e) => {
                    if (e.pointerType === "touch") {
                        data.currentPointerPosition.set(e.point.x, 0, e.point.z)
                        data.originalPointerPosition.set(0, 0, e.point.z)
                    }
                }}
            >
                <planeGeometry args={[20, 20, 1, 1]} />
                <meshBasicMaterial name="hitbox" />
            </mesh>
        </>
    )
}