import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useMemo, useRef } from "react"
import { Group, Mesh, Vector3 } from "three"
import { Tuple3 } from "../types"
import { WORLD_BOTTOM_EDGE, WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "./world/World"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { clamp, ndelta } from "../data/utils"
import { useCollisionDetection, useShader } from "../data/hooks"
import { Owner } from "../data/types"
import { bulletSize, pixelSize, useStore } from "../data/store"
import { damagePlayer, setPlayerObject } from "../data/store/player"
import { createBullet, damagePlane, damageRocket, damageTurret } from "../data/store/actors"
import { damageBarrel } from "../data/store/world" 
import { playerColor } from "../data/theme"
import { MeshLambertFogMaterial } from "./world/MeshLambertFogMaterial"

let _edgemin = new Vector3(WORLD_LEFT_EDGE, WORLD_BOTTOM_EDGE, -100)
let _edgemax = new Vector3(WORLD_RIGHT_EDGE, WORLD_TOP_EDGE, 100)

let depth = 2

console.log("plaxyerxx 6")

interface PlayerProps {
    size?: Tuple3
    z?: number
    y?: number
}

export default function Player({
    size = [1.5, .5, depth],
    z = 0,
    y = 1.5
}: PlayerProps) {
    let playerGroupRef = useRef<Group | null>(null)
    let hitboxRef = useRef<Mesh>(null)
    let lastShotAt = useRef(0)
    let isMovingUp = useRef(false)
    let impactRef = useRef<Mesh>(null)
    let grid = useStore(i => i.world.grid)
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let weapon = useStore(i => i.player.weapon)
    let lastImpactLocation = useStore(i => i.player.lastImpactLocation)
    let targetPosition = useMemo(() => new Vector3(WORLD_CENTER_X, _edgemin.y, z), [])
    let models = useLoader(GLTFLoader, "/models/space.glb")
    let position = useMemo(() => new Vector3(), [])
    let client = useMemo(() => {
        return grid.newClient([0, 0, z], size, {
            type: "player",
            id: "player",
            size,
            position,
        })
    }, [grid])
    let currentPosition = useMemo(() => new Vector3(), [])
    let originalPosition = useMemo(() => new Vector3(), [])
    let speed = 7
    let handleRef = useCallback((object: Group) => {
        if (!object) {
            return
        }

        playerGroupRef.current = object
        setPlayerObject(object)
    }, []) 

    useCollisionDetection({
        position,
        size,
        interval: 3,
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
            }
        }
    })

    useEffect(() => {
        let shootDiv = document.getElementById("shoot") as HTMLElement
        let onKeyDown = (e: KeyboardEvent) => {
            keys[e.code] = true
        }
        let onKeyUp = (e: KeyboardEvent) => {
            delete keys[e.code]
        }
        // shoot 
        let onTouchStartShoot = () => {
            keys.Space = true
        }
        let onTouchEndShoot = () => {
            delete keys.Space
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

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
                })
                lastShotAt.current = Date.now()
            })
        }
    })

    useEffect(()=> {
        if (models && playerGroupRef.current) {
            playerGroupRef.current.position.x = WORLD_CENTER_X
            playerGroupRef.current.position.y = y
            playerGroupRef.current.position.z = z
        }
    }, [position, models])

    // movement
    useFrame((state, delta) => {
        if (playerGroupRef.current && hitboxRef.current) {
            let nd = ndelta(delta)
            let playerGroup = playerGroupRef.current
            let y = clamp(targetPosition.y, _edgemin.y, _edgemax.y)

            playerGroup.position.x += (targetPosition.x - playerGroup.position.x) * (.09 * 60 * nd)
            playerGroup.position.y += (y - playerGroup.position.y) * (.08 * 60 * nd)
            playerGroup.position.z += speed * nd

            currentPosition.z += speed * nd
            hitboxRef.current.position.z = playerGroup.position.z

            position.copy(playerGroup.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    }) 

    return (
        <>
            <mesh ref={impactRef}>
                <sphereGeometry args={[.5, 16, 16]} />
                <meshBasicMaterial color={"white"} />
            </mesh>
            <group
                ref={handleRef}
                scale={.75} 
            >
                <primitive
                    object={models.nodes.plane}
                    receiveShadow
                    castShadow
                    userData={{ type: "player" }}
                    position={[0, 0, 0]}
                >
                    <MeshLambertFogMaterial isInstance={false} color={playerColor} />
                </primitive>
                <mesh userData={{ type: "player" }} visible={false}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial color="red" wireframe />
                </mesh>
            </group>
            <mesh
                ref={hitboxRef}
                position={[0, .1, 0]}
                rotation-x={-Math.PI / 2}
                onPointerUp={() => {
                    isMovingUp.current = false
                }}
                onPointerMove={(e) => {
                    if (e.pointerType === "touch") {
                        let depthThreshold = 2

                        if (Math.abs(originalPosition.z - e.point.z) > depthThreshold) {
                            isMovingUp.current = true
                        }

                        if (isMovingUp.current) {
                            targetPosition.y += (currentPosition.z - e.point.z)
                        }

                        targetPosition.x += (e.point.x - currentPosition.x) * 1.5
                        targetPosition.clamp(_edgemin, _edgemax)
                        currentPosition.copy(e.point)
                    }
                }}
                onPointerDown={(e) => {
                    if (e.pointerType === "touch") {
                        currentPosition.set(e.point.x, 0, e.point.z)
                        originalPosition.set(0, 0, e.point.z)
                    }
                }}
            >
                <planeGeometry args={[20, 20, 1, 1]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </>
    )
}