import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { BufferGeometry, Material, Mesh } from "three"
import random from "@huth/random"

export default function PlayerExhaust() {
    let flameRef = useRef<Mesh<BufferGeometry, Material> | null>(null)
 
    useFrame(() => {
        if (flameRef.current) {
            flameRef.current.scale.x = random.float(.3, .6)
            flameRef.current.scale.z = random.float(.9, 1.1)
            flameRef.current.position.z = -flameRef.current.scale.z - 1
            flameRef.current.material.opacity = random.float(.85, 1)
        }
    })

    return ( 
        <mesh
            scale={[.5, .21, 1]}
            ref={flameRef}
            position-z={-2}
        >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="white" transparent name="solidWhite" />
        </mesh>
    )
}