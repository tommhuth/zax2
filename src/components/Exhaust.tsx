import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { BufferGeometry, Material, Mesh, SphereGeometry, Vector3 } from "three"
import random from "@huth/random"
import { useStore } from "../data/store"
import { Tuple3 } from "../types.global"

interface ExhaustProps {
    rotation?: Tuple3
    offset?: Tuple3
    scale?: Tuple3
    visible?: boolean
    targetPosition?: Vector3
    turbulence?: number
}

const geometry = new SphereGeometry(1, 10, 10)

export default function Exhaust({
    rotation,
    targetPosition,
    scale = [.5, .3, 2],
    offset = [0, 0, 0],
    visible,
    turbulence = 1
}: ExhaustProps) {
    let materials = useStore(i => i.materials)
    let exhaustRef = useRef<Mesh<BufferGeometry, Material> | null>(null)

    useFrame(() => {
        if (exhaustRef.current) {
            exhaustRef.current.scale.x = scale[0] + random.float(-.15, .15) * turbulence
            exhaustRef.current.scale.z = scale[2] + random.float(-.25, .25) * turbulence

            targetPosition && exhaustRef.current.position.set(
                targetPosition.x + offset[0],
                targetPosition.y + offset[1],
                targetPosition.z + offset[2],
            )
        }
    })

    useEffect(() => {
        !targetPosition && offset && exhaustRef.current?.position.set(...offset)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, offset)

    return (
        <mesh
            scale={scale}
            ref={exhaustRef}
            rotation={rotation}
            visible={visible}
            dispose={null}
            material={materials.exhaust}
            geometry={geometry}
        />
    )
}