import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { BufferGeometry, Material, Mesh, Vector3 } from "three"
import random from "@huth/random" 
import { useStore } from "../data/store"
import { Tuple3 } from "../types"

interface ExhaustProps {
    rotation?: Tuple3
    offset?: Tuple3
    scale?: Tuple3
    visible?: boolean
    targetPosition?: Vector3
}

export default function Exhaust({ 
    rotation, 
    targetPosition, 
    scale = [.5, .3, 2],
    offset = [0, 0, 0],
    visible
}: ExhaustProps) {
    let materials = useStore(i => i.materials)
    let exhaustRef = useRef<Mesh<BufferGeometry, Material> | null>(null) 

    useFrame(() => {
        if (exhaustRef.current) {
            exhaustRef.current.scale.x =   random.float(scale[0] * .65, scale[0])
            exhaustRef.current.scale.z =   random.float(scale[2] * .65, scale[2])  

            targetPosition && exhaustRef.current.position.set(
                targetPosition.x + offset[0], 
                targetPosition.y + offset[1], 
                targetPosition.z + offset[2], 
            )
        }
    })

    useEffect(()=> {
        !targetPosition && offset && exhaustRef.current?.position.set(...offset)
    }, offset)

    return ( 
        <mesh
            scale={scale}
            ref={exhaustRef} 
            rotation={rotation}
            visible={visible}
        >
            <sphereGeometry args={[1, 10, 10]} />
            <primitive object={materials.exhaust} attach="material" />
        </mesh> 
    )
}