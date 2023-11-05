import { useFrame } from "@react-three/fiber"
import { useStore } from "../data/store"
import { useRef } from "react"
import { Group } from "three"


export default function EdgeOverlay() {
    let groupRef = useRef<Group>(null)

    useFrame(() => {
        let player = useStore.getState().player.object

        if (player && groupRef.current) {
            groupRef.current.position.setZ(player.position.z)
        }
    })

    return (
        <group ref={groupRef}>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={13}
                position-x={6}
                rotation-y={-.65}
            >
                <planeGeometry args={[12, 100, 1, 1]} />
                <meshBasicMaterial color="black" />
            </mesh>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={12}
                position-x={-26}
            >
                <planeGeometry args={[12, 100, 1, 1]} />
                <meshBasicMaterial color="#000" />
            </mesh>
        </group>

    )
}