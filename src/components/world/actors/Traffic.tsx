import { startTransition, useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import random from "@huth/random"
import { useStore } from "../../../data/store"
import { Tuple3 } from "../../../types"
import { Client } from "../../../data/world/SpatialHashGrid3D"
import { clamp, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import Counter from "../../../data/world/Counter"
import { useCollisionDetection } from "../../../data/collisions"
import { WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../../../data/const"
import { Vector3 } from "three"
import { createExplosion, createParticles } from "../../../data/store/effects"
import { useGravity } from "./Boss"

const SPAWN_LEFT = WORLD_LEFT_EDGE * 3
const SPAWN_RIGHT = WORLD_RIGHT_EDGE * 3

const speeds = [1.1, 1, 1.4, .8]

function createVehicle(z: number, level: Counter, depth: number, forceX?: number): Vehicle {
    let id = random.id()
    let type = "vehicle" as const
    let box = useStore.getState().instances.box
    let grid = useStore.getState().world.grid
    let y = level.next()
    let size: Tuple3 = [random.float(2, 5), random.float(1, 1.5), random.float(1, 2)]
    let x = typeof forceX === "number" ? forceX : y % 2 === 0 ? SPAWN_RIGHT * Math.pow(1.2, y) : SPAWN_LEFT
    let position: Tuple3 = [x, y * 2.5 + size[1] / 2 + .35, z + random.integer(-depth / 2, depth / 2)]
    let client = grid.createClient(position, [3, 1, 2], { type, id })

    return {
        id,
        position: new Vector3(...position),
        rotation: new Vector3(),
        size,
        speed: random.float(2, 2.5) * Math.sign(-x) * speeds[y],
        index: box.index.next(),
        client,
        health: random.integer(10, 35),
    }
}

function VehicleElement({ vehicle, remove }: { vehicle: Vehicle; remove: () => void }) {
    let [dead, setDead] = useState(false)
    let ref = useRef(vehicle)

    useGravity({
        ref,
        active: dead,
        force: -(20 + vehicle.size[1] + + vehicle.size[0]),
        stopAt: vehicle.size[1] * .4
    })

    useCollisionDetection({
        position: vehicle.position,
        size: vehicle.size,
        actions: {
            player: () => {
                vehicle.health = 0
            },
            vehicle: ({ id }) => {
                if (id !== vehicle.id) {
                    vehicle.health = 0
                }
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
            let box = useStore.getState().instances.box
            let grid = useStore.getState().world.grid

            grid.remove(vehicle.client)
            setMatrixNullAt(box.mesh, vehicle.index)
        }
    }, [])

    useEffect(() => {
        if (dead) {
            createExplosion({
                position: vehicle.position.toArray(),
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
                speed: [5, 20]
            })
        }
    }, [dead])

    useFrame((state, delta) => {
        let box = useStore.getState().instances.box
        let grid = useStore.getState().world.grid

        if (
            vehicle.position.x < SPAWN_RIGHT * 1.35
            || vehicle.position.x > SPAWN_LEFT * 1.35
        ) {
            return startTransition(remove)
        }

        if (vehicle.health === 0 && !dead) {
            return startTransition(() => setDead(true))
        }

        if (!dead) {
            vehicle.position.x += delta * vehicle.speed
        }

        setMatrixAt({
            instance: box.mesh,
            index: vehicle.index,
            position: vehicle.position.toArray(),
            rotation: vehicle.rotation.toArray(),
            scale: vehicle.size
        })

        vehicle.client.position = vehicle.position.toArray()
        grid.updateClient(vehicle.client)
    })

    return null
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
}

export default function Traffic({
    z,
    depth = 3,
    frequency = 1200,
}) {
    let lastAdd = useRef(Infinity)
    let level = useMemo(() => new Counter(3), [])
    let [vehicles, setVehicles] = useState<Vehicle[]>(() => {
        return [
            createVehicle(z, level, depth, 6),
            createVehicle(z, level, depth, -6),
        ]
    })

    useFrame((state, delta) => {
        if (lastAdd.current >= frequency) {
            setVehicles([
                ...vehicles,
                createVehicle(z - 2, level, depth)
            ])

            lastAdd.current = 0
        } else {
            lastAdd.current += delta * 1000
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