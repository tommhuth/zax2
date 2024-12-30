import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import model from "@assets/models/turret2.glb"
import { useGLTF } from "@react-three/drei"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import { damp } from "three/src/math/MathUtils.js"
import { ndelta } from "@data/utils"

interface TurretModelProps {
    position: Tuple3
    rotation?: number
}

export type TurretRef = { shoot: () => void }

export default forwardRef<TurretRef, TurretModelProps>(
    function TurretModel({ position, rotation = 0 }, ref) {
        let { nodes } = useGLTF(model) as GLTFModel<["turret2_1", "turret2_2"]>
        let materials = useStore(i => i.materials)
        let barrellRef = useRef<Mesh>(null)

        useImperativeHandle(ref, () => {
            return {
                shoot: () => {
                    if (barrellRef.current) {
                        barrellRef.current.position.z = -.75
                    }
                }
            }
        }, [])

        useFrame((state, delta) => {
            if (!barrellRef.current) {
                return
            }

            barrellRef.current.position.z = damp(barrellRef.current.position.z, 0, 1.5, ndelta(delta))
        })

        return (
            <group
                dispose={null}
                position={position}
                rotation={[0, rotation + Math.PI * .5, 0]}
            >
                <mesh
                    castShadow
                    receiveShadow
                    material={materials.turret}
                    geometry={nodes.turret2_1.geometry}
                />
                <mesh
                    castShadow
                    receiveShadow
                    ref={barrellRef}
                    geometry={nodes.turret2_2.geometry}
                    material={materials.turret}
                />
            </group>
        )
    }
)