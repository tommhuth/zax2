import { useGLTF } from "@react-three/drei"
import { GLTFModel } from "src/types.global"
import { BoxGeometry } from "three"
import { useStore } from "@data/store"
import rockfaceModel from "@assets/models/rockface.glb"
import deviceModel from "@assets/models/device.glb" 
import { useEditorObject } from "../data/hooks"

let box = new BoxGeometry(1, 1, 1, 1, 1, 1)

export default function ObstacleEditor({ id }) {
    const object = useEditorObject(id)
    const type = "device"
    const rockface = useGLTF(rockfaceModel) as GLTFModel<["rockface"]>
    const device = useGLTF(deviceModel) as GLTFModel<["device"]>
    const materials = useStore(i => i.materials)
    const [material, geometry] = {
        box: [materials.device, box] as const,
        rockface: [materials.rock, rockface.nodes.rockface.geometry] as const,
        device: [materials.buildingBase, device.nodes.device.geometry] as const,
    }[type]

    return (
        <mesh
            dispose={null}
            material={material}
            geometry={geometry}
            position={object?.position}
            scale={[object.width, object.height, object.depth]}
            castShadow
            receiveShadow
        />
    )
}