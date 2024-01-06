import { useFrame, useLoader } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useMemo, useRef } from "react"
import { Group, Mesh, Vector3 } from "three"
import { Tuple3 } from "../types"
import { WORLD_BOTTOM_EDGE, WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "./world/World"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { clamp, ndelta } from "../data/utils"
import { useWindowEvent } from "../data/hooks"
import { Owner } from "../data/types"
import { bulletSize, useStore } from "../data/store"
import { damagePlayer, increaseScore, setPlayerObject } from "../data/store/player"
import { createBullet, damagePlane, damageRocket, damageTurret } from "../data/store/actors"
import { damageBarrel } from "../data/store/world"
import { playerColor } from "../data/theme"
import { MeshRetroMaterial } from "./world/MeshRetroMaterial"
import { removeHeatSeaker } from "../data/store/boss"
import { useBulletCollision, useCollisionDetection } from "../data/collisions"
import random from "@huth/random"

let _edgemin = new Vector3(WORLD_RIGHT_EDGE, WORLD_BOTTOM_EDGE, -100)
let _edgemax = new Vector3(WORLD_LEFT_EDGE, WORLD_TOP_EDGE, 100)

let depth = 2

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

export default function Player({
    size = [1.5, .5, depth],
    z = -15,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let flameRef = useRef<Mesh | null>(null)
    let hitboxRef = useRef<Mesh>(null)
    let lastShotAt = useRef(0)
    let isMovingUp = useRef(false)
    let impactRef = useRef<Mesh>(null)
    let grid = useStore(i => i.world.grid)
    let boss = useStore(i => i.boss)
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let weapon = useStore(i => i.player.weapon) 
    let ready = useStore(i => i.ready)
    let lastImpactLocation = useStore(i => i.player.lastImpactLocation)
    let state = useStore(i => i.state)
    let targetPosition = useMemo(() => new Vector3(WORLD_CENTER_X, _edgemin.y, z), [])
    let models = useLoader(GLTFLoader, "/models/space.glb")
    let position = useMemo(() => new Vector3(0, y, z), [])
    let client = useMemo(() => {
        return grid.createClient([0, 0, z], size, {
            type: "player",
            id: "player",
        })
    }, [grid])
    let currentPointerPosition = useMemo(() => new Vector3(), [])
    let originalPointerPosition = useMemo(() => new Vector3(), [])
    let speed = 7
    let handleRef = useCallback((object: Group) => {
        if (!object) {
            return
        }

        playerGroupRef.current = object
        setPlayerObject(object)
    }, [])

    useWindowEvent("keydown", (e: KeyboardEvent) => {
        keys[e.code] = true
    })

    useWindowEvent("keyup", (e: KeyboardEvent) => {
        delete keys[e.code]
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
            position,
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
            keys.Space = true
        }
        let onTouchEndShoot = () => {
            delete keys.Space
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

    useEffect(() => {
        impactRef.current?.scale.set(1, 1, 1)
        impactRef.current?.position.set(...lastImpactLocation)
    }, [lastImpactLocation])

    // impact animation
    useFrame(() => {
        if (impactRef.current) {
            impactRef.current.scale.x += (0 - impactRef.current.scale.x) * .15
            impactRef.current.scale.y += (0 - impactRef.current.scale.y) * .15
            impactRef.current.scale.z += (0 - impactRef.current.scale.z) * .15
        }
    })

    // input
    useFrame((state, delta) => {
        let speedx = 12
        let speedy = 10
        let nd = ndelta(delta)

        if (Object.entries(keys).length) {
            if (keys.KeyA) {
                targetPosition.x += speedx * nd
            } else if (keys.KeyD) {
                targetPosition.x -= speedx * nd
            }

            if (keys.KeyW) {
                targetPosition.y += speedy * nd
            } else if (keys.KeyS) {
                targetPosition.y -= speedy * nd
            }

            targetPosition.clamp(_edgemin, _edgemax)
        }
    })

    // shoot
    useFrame(() => {
        if (Date.now() - lastShotAt.current > weapon.fireFrequency && keys.Space) {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x,
                        position.y,
                        position.z + (depth / 2 + bulletSize[2] / 2) * 1.5
                    ],
                    owner: Owner.PLAYER,
                    damage: weapon.damage,
                    rotation: Math.PI * .5,
                    speed: weapon.speed,
                    color: "#fff",
                })
                lastShotAt.current = Date.now()
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
            let y = clamp(targetPosition.y, _edgemin.y, _edgemax.y)

            playerGroup.position.x += (targetPosition.x - playerGroup.position.x) * (.09 * 60 * nd)
            playerGroup.position.y += (y - playerGroup.position.y) * (.08 * 60 * nd)


            if (!boss || (boss && boss.pauseAt >= playerGroup.position.z)) {
                playerGroup.position.z += speed * nd

                currentPointerPosition.z += speed * nd
            }

            hitboxRef.current.position.z = playerGroup.position.z

            position.copy(playerGroup.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }

        flameRef.current.scale.x = random.float(.3, .6)
        flameRef.current.scale.z = random.float(.9, 1.1)
        flameRef.current.position.z = -flameRef.current.scale.z - 1
        flameRef.current.material.opacity = random.float(.85, 1)
    })

    return (
        <>
            <mesh ref={impactRef}>
                <sphereGeometry args={[.5, 16, 16]} />
                <meshBasicMaterial name="solidWhite" color={"white"} />
            </mesh>
            <group
                ref={handleRef}
                scale={.75}
                visible={state !== "intro"}
            >
                <primitive
                    object={models.nodes.plane}
                    receiveShadow
                    castShadow
                    userData={{ type: "player" }}
                    position={[0, 0, 0]}
                >
                    <MeshRetroMaterial
                        dither={false}
                        isInstance={false}
                        name="player"
                        color={playerColor}
                    />
                </primitive>
                <mesh userData={{ type: "player" }} visible={false}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial color="red" wireframe name="debug" />
                </mesh>
                <mesh
                    userData={{ type: "player" }}
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
                    isMovingUp.current = false
                }}
                onPointerMove={({ pointerType, point }) => {
                    if (pointerType === "touch") {
                        let depthThreshold = 2

                        if (Math.abs(originalPointerPosition.z - point.z) > depthThreshold) {
                            isMovingUp.current = true
                        }

                        if (isMovingUp.current) {
                            targetPosition.y += (point.z - currentPointerPosition.z)
                        }

                        targetPosition.x += (point.x - currentPointerPosition.x) * 1.5
                        targetPosition.clamp(_edgemin, _edgemax)
                        currentPointerPosition.copy(point)
                    }
                }}
                onPointerDown={(e) => {
                    if (e.pointerType === "touch") {
                        currentPointerPosition.set(e.point.x, 0, e.point.z)
                        originalPointerPosition.set(0, 0, e.point.z)
                    }
                }}
            >
                <planeGeometry args={[20, 20, 1, 1]} />
                <meshBasicMaterial name="hitbox" />
            </mesh>
        </>
    )
}