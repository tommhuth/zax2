import { useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Tuple3 } from "src/types.global"
import { ColorRepresentation, Mesh, Vector3 } from "three"

interface DebugBoxProps {
    size: Tuple3
    position: Vector3
    dynamic?: boolean
    color?: ColorRepresentation
    active?: boolean
}

export default function DebugBox({
    size,
    position,
    color = "pink",
    dynamic = false,
    active = true
}: DebugBoxProps) {
    let ref = useRef<Mesh>(null)
    let showColliders = useStore(i => i.debug.showColliders)

    useFrame(() => {
        if (ref.current && dynamic) {
            ref.current.position.copy(position)
        }
    })

    if (!showColliders || !active) {
        return null
    }

    return (
        <mesh ref={ref} scale={size} position={position.toArray()}>
            <boxGeometry />
            <meshBasicMaterial color={color} wireframe />
        </mesh>
    )
}