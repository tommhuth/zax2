import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import random from "@huth/random"
import { useStore } from "../../../data/store"
import { Tuple3 } from "../../../types"
import { Client } from "../../../data/world/SpatialHashGrid3D"
import { clamp, ndelta, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import Counter from "../../../data/world/Counter"
import { useCollisionDetection, useCollisionDetection2 } from "../../../data/collisions"
import { WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../../../data/const"
import { Group, Mesh, Vector3 } from "three"
import { createExplosion, createParticles } from "../../../data/store/effects"
import { useGravity } from "./Boss"
import { useGLTF } from "@react-three/drei"

import cargoShip1 from "../../../../assets/models/cargoship1.glb"
import cargoShip2 from "../../../../assets/models/cargoship2.glb"
import cargoShip3 from "../../../../assets/models/cargoship3.glb"
import cycler from "../../../data/world/cycler"
import { barellColor } from "../../../data/theme"

const SPAWN_LEFT = WORLD_LEFT_EDGE * 3
const SPAWN_RIGHT = WORLD_RIGHT_EDGE * 4

const speeds = [1.1, .8, 1, 1.4]

useGLTF.preload([cargoShip1, cargoShip3, cargoShip2])

function DebugBox({ size, position }) {
    let ref = useRef<Mesh>(null)

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(position)
        }
    })

    return (
        <mesh ref={ref} scale={size}>
            <boxGeometry />
            <meshBasicMaterial color="pink" wireframe />
        </mesh>
    )
}

function CargoShip({ type = 1 }) {
    const ship2 = useGLTF(cargoShip2)
    const ship1 = useGLTF(cargoShip1)
    const materials = useStore(i => i.materials)
    const ship3 = useGLTF(cargoShip3)

    if (type === 3) {
        return (
            <group dispose={null}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship3.nodes.Cube.geometry}
                    material={materials.bossBlue}
                />
            </group>
        )
    }

    if (type === 2) {
        return (
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={ship2.nodes.Mesh_craft_cargoB.geometry}
                    material={materials.bossBlue}
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

    return (
        <group>
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA.geometry}
                material={materials.bossBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_1.geometry}
                material={materials.bossBlue}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_2.geometry}
                material={materials.turret}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={ship1.nodes.Mesh_craft_cargoA_3.geometry}
                material={materials.bossBlue}
            />
        </group>
    )
}

let typeCycler = cycler([1, 2, 3], .2)

function createVehicle(z: number, level: Counter, depth: number, forceX?: number, forceType?: number): Vehicle {
    let type = forceType || typeCycler.next()
    let id = random.id()
    let collisionType = "vehicle" as const
    let box = useStore.getState().instances.box
    let grid = useStore.getState().world.grid
    let y = level.next()
    let sizes: Record<typeof type, Tuple3> = {
        1: [3.5, 1, 2.25],
        2: [3.5, 1, 2.25],
        3: [4, 2, 2.5],
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
        speed: random.float(2, 2.5) * Math.sign(-x) * speeds[y],
        index: box.index.next(),
        client,
        health: random.integer(10, 35),
        type
    }
}

function VehicleElement({ vehicle, remove }: { vehicle: Vehicle; remove: () => void; }) {
    let [dead, setDead] = useState(false)
    let ref = useRef(vehicle)
    let ref2 = useRef<Group>(null)

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
            setTimeout(remove, 200)
        }
    })

    useCollisionDetection2({
        client: vehicle.client,
        actions: {
            player: () => {
                vehicle.health = 0
            },
            vehicle: () => {
                vehicle.health = 0
            },
            bullet: ({ client, type }) => {
                if (type === "vehicle" && vehicle.id === client.data.id) {
                    vehicle.health = clamp(vehicle.health - 10, 0, 100)
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

        if (
            vehicle.position.x < SPAWN_RIGHT
            || vehicle.position.x > SPAWN_LEFT
        ) {
            return startTransition(remove)
        }

        if (vehicle.health === 0 && !dead) {
            return startTransition(() => setDead(true))
        }

        if (!dead) {
            vehicle.position.x += ndelta(delta) * vehicle.speed
        }

        ref2.current?.position.copy(vehicle.position)
        ref2.current?.rotation.set(...vehicle.rotation.toArray())
        vehicle.client.position = vehicle.position.toArray()
        grid.updateClient(vehicle.client)
    })

    return (
        <>
            <group dispose={null} ref={ref2}>
                <CargoShip type={vehicle.type} />
            </group>
        </>
    )
}


interface Vehicle {
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

export default function Traffic({
    z,
    depth = 3,
    frequency = 1500,
}) {
    let lastAdd = useRef(0)
    let level = useMemo(() => new Counter(3), [])
    let [vehicles, setVehicles] = useState<Vehicle[]>([])
    let hasRun = useRef(false)

    useLayoutEffect(() => {
        if (hasRun.current) {
            return
        }

        hasRun.current = true
        setVehicles([
            ...vehicles,
            createVehicle(z, level, depth, 6, 1),
            createVehicle(z, level, depth, .1, 2),
            createVehicle(z, level, depth, -8, 2),
        ])
    }, [])

    useFrame((state, delta) => {
        let player = useStore.getState().player.object

        if (lastAdd.current > frequency && player && player.position.z < z) {
            startTransition(() => { 
                setVehicles([
                    ...vehicles,
                    createVehicle(z - 2, level, depth)
                ]) 
            })

            lastAdd.current = 0
        } else {
            lastAdd.current += ndelta(delta) * 1000
        }
    })

    return (
        <>
            {vehicles.map(i => (
                <VehicleElement
                    vehicle={i}
                    key={i.id}
                    remove={() => {
                        setVehicles(vehicles.filter(j => j.id !== i.id))
                    }}
                />
            ))}
        </>
    )

}