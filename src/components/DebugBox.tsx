import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Mesh } from "three"

export default function DebugBox({ size, position, color = "pink" }) {
    let ref = useRef<Mesh>(null)

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(position)
        }
    })

    return (
        <mesh ref={ref} scale={size}>
            <boxGeometry />
            <meshBasicMaterial color={color} wireframe />
        </mesh>
    )
}
