import { box } from "@data/const"
import { useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Tuple3 } from "src/types.global"
import { Mesh, Vector3 } from "three"

interface DebugBoxProps {
    size: Tuple3
    position?: Vector3
    dynamic?: boolean
    active?: boolean
}

export default function DebugBox({
    size,
    position,
    dynamic = false,
    active = true
}: DebugBoxProps) {
    let ref = useRef<Mesh>(null)
    let showColliders = useStore(i => i.debug.showColliders)
    let materials = useStore(i => i.materials)

    useFrame(() => {
        if (ref.current && dynamic && position) {
            ref.current.position.copy(position)
        }
    })

    if (!showColliders || !active) {
        return null
    }

    return (
        <mesh
            ref={ref}
            scale={size}
            position-x={position?.x}
            position-y={position?.y}
            position-z={position?.z}
            material={materials.cyan}
            geometry={box}
        />
    )
}