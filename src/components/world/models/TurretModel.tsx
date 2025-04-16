import { GLTFModel, Tuple3 } from "src/types.global"
import { useStore } from "../../../data/store"
import model from "@assets/models/turret2.glb"
import { useGLTF } from "@react-three/drei"
import { forwardRef, ReactNode, useImperativeHandle, useRef } from "react"
import { Group, Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import { damp } from "three/src/math/MathUtils.js"
import { ndelta } from "@data/utils"
import random from "@huth/random"

interface TurretModelProps {
    position: Tuple3
    rotation?: number
    children?: ReactNode
}

export type TurretRef = { shoot: () => void; traumatize: (amount?: number) => void }

export default forwardRef<TurretRef, TurretModelProps>(
    function TurretModel({ position, rotation = 0, children }, ref) {
        let { nodes } = useGLTF(model) as GLTFModel<["turret2_1", "turret2_2", "turret2_3", "turret2_4", "turret2_5"]>
        let materials = useStore(i => i.materials)
        let barrellRef = useRef<Mesh>(null)
        let innerRef = useRef<Mesh>(null)
        let wrapperRef = useRef<Group>(null)
        let trauma = useRef(0)

        useImperativeHandle(ref, () => {
            let api = {
                shoot: () => {
                    if (barrellRef.current && innerRef.current) {
                        barrellRef.current.position.x = -.85
                        innerRef.current.position.x = -.125
                    }
                },
                traumatize: (amount = 1) => {
                    trauma.current = amount
                }
            }

            return api
        }, [])

        useFrame((state, delta) => {
            if (!barrellRef.current || !innerRef.current) {
                return
            }

            trauma.current = damp(trauma.current, 0, 8, ndelta(delta))

            if (wrapperRef.current) {
                for (let child of wrapperRef.current.children) {
                    let offset = .125
                    let x = random.float(-offset, offset)
                    let y = random.float(-offset, offset)
                    let z = random.float(-offset, offset)

                    child.position.set(x, y, z).multiplyScalar(trauma.current)
                }
            }

            barrellRef.current.position.x = damp(barrellRef.current.position.x, 0, 2, ndelta(delta))
            innerRef.current.position.x = damp(innerRef.current.position.x, 0, 4, ndelta(delta))
        })

        return (
            <group
                dispose={null}
                position={position}
                rotation={[0, rotation, 0]}
            >
                <group ref={wrapperRef}>
                    {/* top */}
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.turret2_1.geometry}
                        material={materials.turret}
                    />
                    {/* inner */}
                    <mesh
                        castShadow
                        receiveShadow
                        ref={innerRef}
                        geometry={nodes.turret2_3.geometry}
                        material={materials.bossBlack}
                    />
                    {/* details */}
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.turret2_4.geometry}
                        material={materials.bossBlack}
                    />
                    {/* base */}
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.turret2_5.geometry}
                        material={materials.turret}
                    />
                </group>

                {/* barrell */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.turret2_2.geometry}
                    ref={barrellRef}
                    material={materials.bossBlack}
                />

                {children}
            </group>
        )
    }
)