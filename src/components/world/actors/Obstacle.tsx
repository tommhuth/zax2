import random from "@huth/random"
import { useEffect, useMemo } from "react"
import DebugBox from "@components/DebugBox"
import { GLTFModel, Tuple3 } from "src/types.global"
import { BoxGeometry, Vector3 } from "three"
import { useGLTF } from "@react-three/drei"
import { useStore } from "@data/store"
import rockfaceModel from "@assets/models/rockface.glb"
import deviceModel from "@assets/models/device.glb"
import { useCollisionDetection } from "@data/collisions"
import { createParticles } from "@data/store/effects"
import { deviceColor } from "@data/theme"
import { useWorldPart } from "../WorldPartWrapper"

let box = new BoxGeometry(1, 1, 1, 1, 1, 1)

interface ObstacleProps {
    size: Tuple3
    position: Tuple3
    type: "box" | "device" | "rockface"
    rotation?: number
}

export default function Obstacle({
    size,
    rotation = 0,
    position,
    type = "box",
}: ObstacleProps) {
    const partPosition = useWorldPart()
    const rockface = useGLTF(rockfaceModel) as GLTFModel<["rockface"]>
    const device = useGLTF(deviceModel) as GLTFModel<["device"]>
    const materials = useStore(i => i.materials)
    const grid = useStore(i => i.world.grid)
    const resolvedPosition: Tuple3 = [
        position[0],
        position[1],
        position[2] + partPosition[2]
    ]
    const debugPosition = useMemo(() => new Vector3(...resolvedPosition), [])
    const id = useMemo(() => random.id(), [])
    const client = useMemo(() => {
        return grid.createClient(resolvedPosition, size, {
            type: "obstacle",
            id,
        })
    }, [grid, id])
    const [material, geometry, color] = {
        box: [materials.device, box, deviceColor] as const,
        rockface: [materials.rock, rockface.nodes.rockface.geometry, "#0F5"] as const,
        device: [materials.buildingBase, device.nodes.device.geometry, deviceColor] as const,
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
            <mesh
                dispose={null}
                material={material}
                geometry={geometry}
                position={resolvedPosition}
                scale={size}
                rotation-y={rotation}
                castShadow
                receiveShadow
            />

            <DebugBox size={size} position={debugPosition} />
        </>
    )
}