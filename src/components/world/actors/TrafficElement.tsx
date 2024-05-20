import { useFrame } from "@react-three/fiber"
import { useState, useRef, useEffect, startTransition, useMemo } from "react"
import { Group, Vector3 } from "three"
import { clamp } from "three/src/math/MathUtils.js"
import { useCollisionDetection } from "../../../data/collisions"
import { createExplosion, createParticles } from "../../../data/store/effects"
import { barellColor } from "../../../data/theme"
import { ndelta } from "../../../data/utils"
import { useGravity } from "./Boss"

import { useGLTF } from "@react-three/drei"
import { useStore } from "../../../data/store"
import { Tuple3 } from "../../../types"
import { Client } from "../../../data/SpatialHashGrid3D"
import Counter from "../../../data/Counter"
import random from "@huth/random"
import Cycler from "../../../data/Cyclerx"
import { WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../../../data/const"


import cargoShip1 from "../../../../assets/models/cargoship1.glb"
import cargoShip2 from "../../../../assets/models/cargoship2.glb"
import cargoShip2Destroyed from "../../../../assets/models/cargoship2_destroyed.glb"
import cargoShip1Destroyed from "../../../../assets/models/cargoship1_destroyed.glb"

useGLTF.preload([cargoShip1, cargoShip2, cargoShip1Destroyed, cargoShip2Destroyed])

function CargoShip({ type = 1, destroyed }) {
    const ship1 = useGLTF(cargoShip1)
    const ship2 = useGLTF(cargoShip2)
    const ship1Destroyed = useGLTF(cargoShip1Destroyed)
    const ship2Destroyed = useGLTF(cargoShip2Destroyed)
    const materials = useStore(i => i.materials)

    if (type === 2) {
        if (destroyed) {
            return (
                <group dispose={null}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={ship2Destroyed.nodes.Mesh_craft_cargoB001.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={ship2Destroyed.nodes.Mesh_craft_cargoB001_1.geometry}
                        material={materials.bossBlue}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={ship2Destroyed.nodes.Mesh_craft_cargoB001_2.geometry}
                        material={materials.bossDarkBlue}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={ship2Destroyed.nodes.Mesh_craft_cargoB001_3.geometry}
                        material={materials.bossBlue}
                    />
                </group>
            )
        }

        return (
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship2.nodes.Mesh_craft_cargoB.geometry}
                    material={materials.bossDarkBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship2.nodes.Mesh_craft_cargoB_1.geometry}
                    material={materials.bossBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship2.nodes.Mesh_craft_cargoB_2.geometry}
                    material={materials.bossDarkBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship2.nodes.Mesh_craft_cargoB_3.geometry}
                    material={materials.bossBlue}
                />
            </group>
        )
    }

    if (destroyed) {
        return (
            <group dispose={null}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship1Destroyed.nodes.Mesh_craft_cargoA001.geometry}
                    material={materials.bossDarkBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship1Destroyed.nodes.Mesh_craft_cargoA001_1.geometry}
                    material={materials.bossBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship1Destroyed.nodes.Mesh_craft_cargoA001_2.geometry}
                    material={materials.bossDarkBlue}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship1Destroyed.nodes.Mesh_craft_cargoA001_3.geometry}
                    material={materials.bossBlue}
                />
            </group>
        )
    }

    return (
        <group>
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA.geometry}
                material={materials.bossDarkBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_1.geometry}
                material={materials.bossDarkBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_2.geometry}
                material={materials.bossBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_3.geometry}
                material={materials.plane}
            />
        </group>
    )
}

export interface TrafficElementObject {
    id: string
    position: Vector3
    rotation: Vector3
    speed: number
    size: Tuple3
    client: Client
    index: number
    health: number
    type: number
}

const SPAWN_LEFT = WORLD_LEFT_EDGE * 3
const SPAWN_RIGHT = WORLD_RIGHT_EDGE * 4
const speeds = [1.1, .8, 1, 1.4]

let typeCycler = new Cycler([1, 2], .5)

export function createTrafficElement(z: number, level: Counter, depth: number, forceX?: number, forceType?: number): TrafficElementObject {
    let type = forceType || typeCycler.next()
    let id = random.id()
    let collisionType = "vehicle" as const
    let box = useStore.getState().instances.box
    let grid = useStore.getState().world.grid
    let y = level.next()
    let sizes: Record<typeof type, Tuple3> = {
        1: [4, 1.25, 2.5],
        2: [4, 1.25, 2.5],
    }
    let size: Tuple3 = sizes[type]
    let x = typeof forceX === "number" ? forceX : y % 2 === 0 ? SPAWN_RIGHT : SPAWN_LEFT
    let position: Tuple3 = [
        x,
        y * 3 + 1.5,
        z + random.float(-depth / 2, depth / 2)
    ]
    let client = grid.createClient(position, [3, 1, 2], { type: collisionType, id })

    return {
        id,
        position: new Vector3(...position),
        rotation: new Vector3(0, -Math.PI * .5 * Math.sign(-x), 0),
        size,
        speed: 2 * Math.sign(-x) * speeds[y % speeds.length],
        index: box.index.next(),
        client,
        health: random.integer(10, 35),
        type
    }
}

interface TrafficElementProps {
    vehicle: TrafficElementObject;
    remove: () => void;
}

export default function TrafficElement({ vehicle, remove }: TrafficElementProps) {
    let [dead, setDead] = useState(false)
    let ref = useRef(vehicle)
    let ref2 = useRef<Group>(null)
    let [shouldDisintegrate] = useState(() => random.boolean(.5))
    let xp = useRef(0)
    let rp = useRef(0)
    let basez = useMemo(() => vehicle.position.z, [])
    let baser = useMemo(() => vehicle.rotation.y, [])

    useGravity({
        ref,
        active: dead,
        force: -(20 + vehicle.size[1] * vehicle.size[0]),
        stopAt: 0,
        onGrounded() {
            createExplosion({
                position: [
                    vehicle.position.x,
                    0,
                    vehicle.position.z,
                ],
                count: 10,
                radius: .65,
                fireballCount: 6,
                fireballPath: [
                    [vehicle.position.x, 0, vehicle.position.z],
                    [0, 4, 0]
                ]
            })
            createParticles({
                position: vehicle.position.toArray(),
                count: 10,
                radius: [.1, .5],
                normal: [0, 0, 0],
                spread: [[-1, 1], [-1, 1]],
                speed: [5, 20],
                color: barellColor
            })
            setTimeout(() => shouldDisintegrate && remove(), 200)
        }
    })

    useCollisionDetection({
        client: vehicle.client,
        actions: {
            player: () => {
                vehicle.health = 0
            },
            vehicle: () => {
                vehicle.health = 0
            },
            bullet: ({ client, type, bullet }) => {
                if (type === "vehicle" && vehicle.id === client.data.id) {
                    vehicle.health = clamp(vehicle.health - 10, 0, 100)
                    xp.current += .13
                    rp.current += .15 * -clamp((bullet.position.x - vehicle.position.x) / 2, -1, 1)
                }
            }
        }
    })

    useEffect(() => {
        return () => {
            let grid = useStore.getState().world.grid

            grid.remove(vehicle.client)
        }
    }, [])

    useEffect(() => {
        if (dead) {
            startTransition(() => {
                createExplosion({
                    position: [
                        vehicle.position.x,
                        vehicle.position.y - 1,
                        vehicle.position.z,
                    ],
                    count: 10,
                    radius: .65,
                    fireballCount: 17
                })
                createParticles({
                    position: vehicle.position.toArray(),
                    count: 10,
                    radius: [.1, .5],
                    normal: [0, 0, 0],
                    spread: [[-1, 1], [-1, 1]],
                    speed: [5, 20],
                    color: barellColor
                })
            })
        }
    }, [dead])

    useFrame((state, delta) => {
        let grid = useStore.getState().world.grid
        let diagonal = useStore.getState().world.diagonal
        let playerPosition = useStore.getState().player.position

        if (
            vehicle.position.x < SPAWN_RIGHT
            || vehicle.position.x > SPAWN_LEFT
            || vehicle.position.z + diagonal * .75 < playerPosition.z
        ) {
            return startTransition(remove)
        }

        if (vehicle.health === 0 && !dead) {
            return startTransition(() => setDead(true))
        }

        if (!dead) {
            vehicle.position.x += ndelta(delta) * vehicle.speed
        }

        vehicle.position.z = (basez + xp.current)
        vehicle.rotation.y = (baser + rp.current )
        xp.current += -xp.current * .15
        rp.current += -rp.current * .1

        ref2.current?.position.copy(vehicle.position)
        ref2.current?.rotation.set(...vehicle.rotation.toArray())
        vehicle.client.position = vehicle.position.toArray()
        grid.updateClient(vehicle.client)
    })

    return (
        <group
            dispose={null}
            ref={ref2}
            scale={1.3}
        >
            <CargoShip type={vehicle.type} destroyed={dead} />
        </group>
    )
}