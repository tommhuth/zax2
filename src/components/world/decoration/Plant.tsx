import { useEffect, useMemo, useRef, useState } from "react"
import { useInstance } from "../models/InstancedMesh"
import { clamp, setBufferAttribute, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper"
import { store, useStore } from "../../../data/store"
import { useCollisionDetection } from "../../../data/collisions"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { createParticles } from "../../../data/store/effects"
import { Owner } from "../../../data/types"
import { easeOutQuad } from "../../../data/shaping"
import { damp } from "three/src/math/MathUtils.js"

interface PlantProps {
    position: Tuple3
    scale: number
}

interface Leaf {
    position: Tuple3
    acceleration: Tuple3
    rotation: Tuple3
    scale: Tuple3
    time: number
    index: number
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
    let [leaves, setLeaves] = useState<Leaf[]>([])
    let createLeaves = () => { 
        let leaf = store.getState().instances.leaf

        setLeaves(new Array(random.integer(6, 8)).fill(null).map(() => {
            let x = position.x + random.float(-size[0] * .25, size[0] * .25)
            let z = position.z + random.float(-size[2] * .25, size[2] * .25)
            let baseScale = random.float(scale * .2, scale * .7)

            return {
                position: [
                    x,
                    position.y + random.float(.25, size[1] * .5),
                    z
                ],
                acceleration: [
                    (x - position.x) * .125,
                    random.float(-.06, 0),
                    (z - position.z) * .125,
                ],
                rotation: [0, random.float(0, Math.PI * 2), 0],
                scale: [baseScale, random.float(0, 1.65), baseScale],
                time: random.float(-1, 1),
                index: leaf.index.next()
            }
        }))
    }

    useCollisionDetection({
        interval: 2,
        position: position,
        size,
        when: () => health > 0,
        actions: {
            bullet: ({ client, type, bullet }) => {
                if (client.data.id === id && type === "plant" && bullet.owner === Owner.PLAYER) {
                    setHealth(Math.max(health - 10, 0))
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
            grid.remove(client)
            setMatrixNullAt(instance, index)
            createLeaves()
            createParticles({
                position: position.toArray(),
                count: [20, 25],
                radius: [.01 * scale, .3],
                normal: [0, 1, 0],
                spread: [[-.85, .85], [0, 1]],
                speed: [10, 27],
                color: "#00ff9d",
                stagger: [0, 0]
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
        trauma.current = damp(trauma.current, 0, 8, delta)
    })

    // leaves
    useFrame((state, delta) => {
        let { instances } = store.getState()
        let floorY = .25

        for (let leaf of leaves) {
            let t = easeOutQuad(clamp((leaf.position[1] - floorY) / 5, 0, 1))

            leaf.position[0] += leaf.acceleration[0]
            leaf.position[1] = Math.max(floorY, leaf.position[1] - leaf.acceleration[1])
            leaf.position[2] += leaf.acceleration[2]

            // fake gravity and xz movement
            leaf.acceleration[1] += delta * .075 * leaf.scale[0]
            leaf.acceleration[2] = damp(leaf.acceleration[2], 0, 2, delta)
            leaf.acceleration[0] = damp(leaf.acceleration[0], 0, 2, delta)
            leaf.rotation[1] += delta * t

            leaf.time += delta

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

    return null
}