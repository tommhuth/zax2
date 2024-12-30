import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import rocketModel from "@assets/models/rocket.glb"
import { useGLTF } from "@react-three/drei"
import { forwardRef } from "react"
import { Mesh } from "three"

interface RocketModelProps {
    position: Tuple3
    rotation?: number
    removed: boolean
}

export default forwardRef<Mesh, RocketModelProps>(
    function RocketModel({ position, removed, rotation = 0 }, ref) {
        let { nodes } = useGLTF(rocketModel) as GLTFModel<["rocket", "platform"]>
        let materials = useStore(i => i.materials)

        return (
            <>
                <mesh
                    castShadow
                    receiveShadow
                    ref={ref}
                    rotation-y={rotation}
                    visible={!removed}
                    dispose={null}
                    geometry={nodes.rocket.geometry}
                    material={materials.rocket}
                />
                <mesh
                    castShadow
                    receiveShadow
                    dispose={null}
                    geometry={nodes.platform.geometry}
                    material={materials.device}
                    position={position}
                />
            </>
        )
    }
)