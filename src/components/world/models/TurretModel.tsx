import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import model from "@assets/models/turret2.glb"
import { useGLTF } from "@react-three/drei"
import { forwardRef, ReactNode, useImperativeHandle, useRef } from "react"
import { Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import { damp } from "three/src/math/MathUtils.js"
import { ndelta } from "@data/utils"

interface TurretModelProps {
    position: Tuple3
    rotation?: number
    children?: ReactNode
}

export type TurretRef = { shoot: () => void }

export default forwardRef<TurretRef, TurretModelProps>(
    function TurretModel({ position, rotation = 0, children }, ref) {
        let { nodes } = useGLTF(model) as GLTFModel<["turret2_1", "turret2_2"]>
        let materials = useStore(i => i.materials)
        let barrellRef = useRef<Mesh>(null)

        useImperativeHandle(ref, () => {
            return {
                shoot: () => {
                    if (barrellRef.current) {
                        barrellRef.current.position.x = -.75
                    }
                }
            }
        }, [])

        useFrame((state, delta) => {
            if (!barrellRef.current) {
                return
            }

            barrellRef.current.position.x = damp(barrellRef.current.position.x, 0, 3, ndelta(delta))
        })

        return (
            <group
                dispose={null}
                position={position}
                rotation={[0, rotation, 0]}
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
                {children}
            </group>
        )
    }
)