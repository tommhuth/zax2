import random from "@huth/random"
import { useEffect, useMemo } from "react"
import DebugBox from "@components/DebugBox"
import { Tuple3 } from "src/types.global"
import { Vector3 } from "three"
import { useStore } from "@data/store"
import { useCollisionDetection } from "@data/collisions"
import { createParticles } from "@data/store/effects"
import { deviceColor } from "@data/theme"
import { useWorldPart } from "../WorldPartWrapper"
import ObstacleModel from "../models/ObstacleModel"

interface ObstacleProps {
    size: Tuple3
    position: Tuple3
    type: "box" | "device" | "rockface"
    rotation?: number
}

export default function Obstacle({
    size: [width, height, depth],
    rotation = 0,
    position: [x, y, z],
    type = "box",
}: ObstacleProps) {
    const part = useWorldPart()
    const grid = useStore(i => i.world.grid)
    const resolvedPosition: Tuple3 = useMemo(() => {
        return [x, y, part.position.z + z]
    }, [part.position.z, x, y, z])
    const debugPosition = useMemo(() => new Vector3(...resolvedPosition), [resolvedPosition])
    const id = useMemo(() => random.id(), [])
    const client = useMemo(() => {
        return grid.createClient(resolvedPosition, [width, height, depth], {
            type: "obstacle",
            id,
        })
    }, [grid, id, resolvedPosition, width, height, depth])
    const color = {
        box: deviceColor,
        rockface: "#0F5",
        device: deviceColor
    }[type]

    useCollisionDetection({
        client,
        bullet: ({ intersection, normal }) => {
            createParticles({
                position: intersection,
                speed: [7, 14],
                offset: [[0, 0], [0, 0], [0, 0]],
                normal,
                count: [2, 4],
                stagger: [0, 0],
                radius: [.05, .2],
                color,
            })
        }
    })

    useEffect(() => {
        if (!grid || !client) {
            return
        }

        return () => {
            grid.removeClient(client)
        }
    }, [client, grid])

    return (
        <>
            <ObstacleModel
                position={resolvedPosition}
                size={[width, height, depth]}
                rotation={rotation}
                type={type}
            />

            <DebugBox
                size={[width, height, depth]}
                position={debugPosition}
            />
        </>
    )
}