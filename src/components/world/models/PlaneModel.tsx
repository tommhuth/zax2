import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import { useGLTF } from "@react-three/drei"
import { forwardRef } from "react"
import planeModel from "@assets/models/plane.glb"
import { Mesh, Vector3 } from "three"
import Exhaust from "../effects/Exhaust"

interface PlaneModelProps {
    position: Vector3
    rotation?: Tuple3
    moving?: boolean
    disabled?: boolean
}

export default forwardRef<Mesh, PlaneModelProps>(
    function PlaneModel({ position, rotation = [0, 0, 0], moving = true, disabled = false }, ref) {
        let { nodes } = useGLTF(planeModel) as GLTFModel<["plane_1", "plane_2", "plane_3"]>
        let materials = useStore(i => i.materials)

        return (
            <>
                <group
                    position={position.toArray()}
                    ref={ref}
                    dispose={null}
                    rotation={[rotation[0], rotation[1] + Math.PI, rotation[2]]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.plane_1.geometry}
                        material={materials.plane}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.plane_2.geometry}
                        material={materials.bossBlack}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.plane_3.geometry}
                        material={materials.turret}
                    />
                </group>

                {moving && (
                    <Exhaust
                        targetPosition={position}
                        offset={[0, .35, 2]}
                        scale={[.4, .2, .9]}
                        rotation={[0, -Math.PI, 0]}
                        visible={!disabled}
                    />
                )}
            </>
        )
    }
)