import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import { useGLTF } from "@react-three/drei"
import rockfaceModel from "@assets/models/rockface.glb"
import deviceModel from "@assets/models/device.glb"
import { BoxGeometry, BufferGeometry, Material } from "three"

export type ObstacleType = "box" | "device" | "rockface"

let box = new BoxGeometry(1, 1, 1, 1, 1, 1)

interface ObstacleModelProps {
    position: Tuple3
    size: Tuple3
    rotation?: number
    type: ObstacleType
}

export default function ObstacleModel({ rotation, position, type, size }: ObstacleModelProps) {
    let materials = useStore(i => i.materials)
    let rockface = useGLTF(rockfaceModel) as GLTFModel<["rockface"]>
    let device = useGLTF(deviceModel) as GLTFModel<["device"]>
    let style: Record<ObstacleType, [Material, BufferGeometry]> = {
        box: [materials.device, box],
        rockface: [materials.rock, rockface.nodes.rockface.geometry],
        device: [materials.buildingBase, device.nodes.device.geometry],
    }
    let [material, geometry] = style[type]

    return (
        <mesh
            dispose={null}
            material={material}
            geometry={geometry}
            position={position}
            rotation-y={rotation}
            scale={size}
            castShadow
            receiveShadow
        />
    )
} 