import { forwardRef, startTransition, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useInstance } from "../models/InstancedMesh"
import { clamp, ndelta, setBufferAttribute, setMatrixAt, setMatrixNullAt } from "@data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types.global"
import { useWorldPart } from "../WorldPartWrapper"
import { store, useStore } from "@data/store"
import { useCollisionDetection } from "@data/collisions"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { createParticles } from "@data/store/effects"
import { Owner } from "@data/types"
import { damp } from "three/src/math/MathUtils.js"
import DebugBox from "@components/DebugBox"
import { plantColor } from "@data/theme"

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

type LeavesRef = { spawn: (count: number, position: Vector3, size: Tuple3) => void }

const Leaves = forwardRef<LeavesRef>((props, ref) => {
    let [leaves, setLeaves] = useState<Leaf[]>([])

    useImperativeHandle(ref, () => {
        return {
            spawn(count: number, position: Vector3, size: Tuple3) {
                let instance = store.getState().instances.leaf
                let leaves = Array.from({ length: random.integer(count - 2, count) })
                    .fill(null)
                    .map((_i, index, list) => {
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
                            index: instance.index.next()
                        }
                    })

                setLeaves(leaves)
            }
        }
    })

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

    return null
})

interface PlantProps {
    position: Tuple3
    scale?: number
    rotation?: number
}

let [width, height, depth]: Tuple3 = [5, 3, 4]
let colors = [
    plantColor,
    "#3d005c",
    "#e600ff"
]

export default function Plant({
    position: [x, y, z] = [0, 0, 0],
    scale = 1,
    rotation = 0
}: PlantProps) {
    let part = useWorldPart()
    let [index, instance] = useInstance("plant", {
        scale,
        rotation: [0, rotation, 0],
        position: [x, y, part.position.z + z],
    })
    let grid = useStore(i => i.world.grid)
    let size: Tuple3 = useMemo(() => [
        width * scale * .5,
        height * scale,
        depth * scale * .5
    ], [scale])
    let id = useMemo(() => random.id(), [])
    let [maxHealth] = useState(random.pick(30, 40, 20))
    let [health, setHealth] = useState(maxHealth)
    let position = useMemo(() => {
        return new Vector3(x, y, part.position.z + z)
    }, [x, y, z, part.position.z])
    let client = useMemo(() => {
        return grid.createClient(
            position.toArray(),
            size,
            { type: "plant", id }
        )
    }, [grid, id, size, position])
    let trauma = useRef(0)
    let leavesRef = useRef<LeavesRef>(null)

    useCollisionDetection({
        interval: 2,
        client,
        active: () => health > 0,
        bullet: ({ client, type, bullet }) => {
            if (client.data.id === id && type === "plant" && bullet.owner === Owner.PLAYER) {
                setHealth(Math.max(health - 10, 0))
            }
        },
        player: () => {
            setHealth(Math.max(health - 5, 0))
        }
    })

    // health change
    useEffect(() => {
        if (typeof index === "number" && health < maxHealth) {
            trauma.current += .3

            startTransition(() => {
                createParticles({
                    position: position.toArray(),
                    count: health === 0 ? [20, 25] : [5, 10],
                    radius: [.01 * scale, .3],
                    normal: [0, 1, 0],
                    spread: [[-.85, .85], [0, 1]],
                    speed: [10, 27],
                    color: colors,
                    stagger: [0, 0],
                    gravity: [0, -random.integer(35, 50), 0]
                })

                if (health === 0) {
                    grid.removeClient(client)
                    setMatrixNullAt(instance, index as number)
                    leavesRef.current?.spawn(8, position, size)
                }
            })
        }
    }, [maxHealth, health, grid, index, position, scale, instance, client, size])

    // unmount
    useEffect(() => {
        return () => grid.removeClient(client)
    }, [client, grid])

    // trauma
    useFrame((state, delta) => {
        if (typeof index !== "number" || trauma.current < .001) {
            return
        }

        let { instances } = store.getState()

        setBufferAttribute(instances.plant.mesh.geometry, "aTrauma", trauma.current, index)
        trauma.current = damp(trauma.current, 0, 8, ndelta(delta))
    })

    return (
        <>
            <Leaves ref={leavesRef} />
            <DebugBox size={size} position={position} />
        </>
    )
}