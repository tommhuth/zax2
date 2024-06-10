import { startTransition, useEffect, useMemo, useRef, useState } from "react"
import { useInstance } from "../models/InstancedMesh"
import { clamp, ndelta, setBufferAttribute, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper"
import { store, useStore } from "../../../data/store"
import { useCollisionDetection } from "../../../data/collisions"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { createParticles } from "../../../data/store/effects"
import { Owner } from "../../../data/types"
import { damp } from "three/src/math/MathUtils.js"
import DebugBox from "@components/DebugBox"

interface PlantProps {
    position: Tuple3
    scale: number
}

interface Leaf {
    position: Tuple3
    acceleration: Tuple3
    velocity: Tuple3
    rotation: Tuple3
    scale: Tuple3
    time: number
    index: number
    friction: number
}

let width = 5
let height = 2.75
let depth = 4

export default function Plant({
    position: [x, y, z] = [0, 0, 0],
    scale = 1
}: PlantProps) {
    let [index, instance] = useInstance("plant")
    let partPosition = useWorldPart()
    let grid = useStore(i => i.world.grid)
    let size: Tuple3 = [width * scale * .5, height * scale, depth * scale * .5]
    let id = useMemo(() => random.id(), [])
    let [health, setHealth] = useState(random.pick(30, 40, 20))
    let position = useMemo(() => new Vector3(x, y, partPosition[2] + z), [])
    let client = useMemo(() => {
        return grid.createClient(
            position.toArray(),
            size,
            { type: "plant", id }
        )
    }, [grid])
    let trauma = useRef(0)
    let leaves = useMemo<Leaf[]>(() => [], [])
    let createLeaves = () => {
        let leaf = store.getState().instances.leaf

        leaves.push(...new Array(random.integer(6, 8)).fill(null).map((_i, index, list) => {
            let x = position.x + random.float(-.5, .5)
            let z = position.z + random.float(-.5, .5)
            let baseScale = 1 + (index / (list.length - 1)) * random.float(-.4, .1)

            return {
                position: [
                    x,
                    position.y + .5 + (index / (list.length - 1)) * (size[1] * .75),
                    z
                ] as Tuple3,
                acceleration: [0, -random.float(8, 10), 0] as Tuple3,
                velocity: [
                    (x - position.x) * random.float(6, 12),
                    random.float(.0, 6),
                    (z - position.z) * random.float(6, 12),
                ] as Tuple3,
                friction: random.float(.9, 1.35),
                rotation: [0, random.float(0, Math.PI * 2), 0] as Tuple3,
                scale: [baseScale, random.float(1, 2.25), baseScale] as Tuple3,
                time: random.float(0, Math.PI * 2),
                index: leaf.index.next()
            }
        }))
    }

    useCollisionDetection({
        interval: 2,
        client,
        active: () => health > 0,
        actions: {
            bullet: ({ client, type, bullet }) => {
                if (client.data.id === id && type === "plant" && bullet.owner === Owner.PLAYER) { 
                    setHealth(Math.max(health - 10, 0))
                    createParticles({
                        position: position.toArray(),
                        count: [5, 10],
                        radius: [.01 * scale, .3],
                        normal: [0, 1, 0],
                        spread: [[-.85, .85], [0, 1]],
                        speed: [10, 27],
                        color: "#00ff9d",
                        stagger: [0, 0],
                        gravity: [0, -random.integer(35, 50), 0]
                    }) 
                }
            },
            player: () => { 
                setHealth(Math.max(health - 5, 0)) 
            }
        }
    })

    // health change
    useEffect(() => {
        if (health === 0 && typeof index === "number") {
            startTransition(()=> {
                grid.remove(client)
                setMatrixNullAt(instance, index as number)
                createLeaves()
                createParticles({
                    position: position.toArray(),
                    count: [20, 25],
                    radius: [.01 * scale, .3],
                    normal: [0, 1, 0],
                    spread: [[-.85, .85], [0, 1]],
                    speed: [10, 27],
                    color: "#00ff9d",
                    stagger: [0, 0],
                    gravity: [0, -random.integer(35, 50), 0]
                })
            }) 
        }

        trauma.current += .3
    }, [health, grid, client])

    // unmount
    useEffect(() => {
        return () => grid.remove(client)
    }, [client, grid])

    // set instance
    useEffect(() => {
        if (typeof index === "number") {
            setMatrixAt({
                instance,
                index,
                scale,
                rotation: [0, random.float(0, Math.PI * 2), 0],
                position: [x, y, partPosition[2] + z],
            })
        }
    }, [index, instance])

    // trauma
    useFrame((state, delta) => {
        if (typeof index !== "number" || trauma.current < .001) {
            return
        }

        let { instances } = store.getState()

        setBufferAttribute(instances.plant.mesh.geometry, "aTrauma", trauma.current, index)
        trauma.current = damp(trauma.current, 0, 8, ndelta(delta))
    })

    // leaves
    useFrame((state, delta) => {
        let { instances } = store.getState()
        let floorY = .25
        let nd = ndelta(delta)

        for (let leaf of leaves) {
            let t = clamp((leaf.position[1] - floorY) / 5, 0, 1)

            leaf.position[0] += leaf.velocity[0] * nd
            leaf.position[1] += leaf.velocity[1] * nd
            leaf.position[2] += leaf.velocity[2] * nd

            leaf.position[1] = Math.max(leaf.position[1], floorY)

            leaf.velocity[2] = damp(leaf.velocity[2], 0, leaf.friction, nd)
            leaf.velocity[1] += leaf.acceleration[1] * nd
            leaf.velocity[0] = damp(leaf.velocity[0], 0, leaf.friction, nd)

            // terminal vel
            leaf.acceleration[1] = Math.max(leaf.acceleration[1], -5)

            leaf.rotation[1] += nd * t
            leaf.time += nd

            setMatrixAt({
                instance: instances.leaf.mesh,
                index: leaf.index,
                position: [
                    leaf.position[0] + Math.cos(leaf.time * 4) * t,
                    leaf.position[1],
                    leaf.position[2] + Math.sin(leaf.time * 5) * t
                ],
                scale: leaf.scale,
                rotation: [
                    Math.cos(leaf.time * 3) * t,
                    leaf.rotation[1] + Math.cos(leaf.time * 1) * t,
                    Math.sin(leaf.time * 5) * t
                ]
            })
        }
    })

    return <DebugBox size={size} position={position} />
}