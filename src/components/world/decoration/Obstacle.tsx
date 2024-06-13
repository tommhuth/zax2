import random from "@huth/random"
import { useEffect, useMemo } from "react"
import DebugBox from "@components/DebugBox"
import { GLTFModel, Tuple3 } from "src/types"
import { BoxGeometry, Vector3 } from "three"
import { useGLTF } from "@react-three/drei"
import { useStore } from "@data/store"
import rockfaceModel from "@assets/models/rockface.glb"
import deviceModel from "@assets/models/device.glb"
import { useCollisionDetection } from "@data/collisions"
import { createParticles } from "@data/store/effects"
import { deviceColor } from "@data/theme" 

let box = new BoxGeometry(1, 1, 1, 1, 1, 1)

export default function Obstacle({
    size,
    position,
    type = "box",
}: { size: Tuple3, position: Tuple3, type: "box" | "device" | "rockface" }) {
    const rockface = useGLTF(rockfaceModel) as GLTFModel<["rockface"]>
    const device = useGLTF(deviceModel) as GLTFModel<["device"]>
    const materials = useStore(i => i.materials)
    const grid = useStore(i => i.world.grid)
    const debugPosition = useMemo(() => new Vector3(...position), [])
    const id = useMemo(()=> random.id(), [])
    const client = useMemo(() => {
        return grid.createClient(position, size, {
            type: "obstacle",
            id,
        })
    }, [grid, id]) 
    const [material, geometry, color] = {
        box: [materials.device, box, deviceColor] as const,
        rockface: [materials.rock, rockface.nodes.rockface.geometry, "#0F5"] as const,
        device: [materials.device, device.nodes.device.geometry, deviceColor] as const,
    }[type] 

    useCollisionDetection({
        actions: {
            bullet: ({ intersection, normal, client }) => {
                if (client.data.id !== id) {
                    return 
                } 

                createParticles({
                    position: intersection,
                    speed: [7, 14],
                    offset: [[0,0],[0,0],[0,0]],
                    normal,
                    count: [2, 4],
                    stagger: [0, 0],
                    radius: [.05, .2],
                    color,
                })
            }
        }
    }) 

    useEffect(() => {
        if (!grid || !client) {
            return
        }

        return () => {
            grid.remove(client)
        }
    }, [client, grid])

    return (
        <>
            <mesh
                dispose={null}
                material={material}
                geometry={geometry}
                position={position}
                scale={size}
                castShadow
                receiveShadow
            />

            <DebugBox size={size} position={debugPosition} />
        </>
    )
}