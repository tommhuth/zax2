import { useFrame } from "@react-three/fiber"
import { useStore } from "../data/store"
import { useRef } from "react"
import { Group, MeshBasicMaterial } from "three" 

let material = new MeshBasicMaterial({ color: "#000", name: "edge" })

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
                material={material}
            >
                <planeGeometry args={[12, 100, 1, 1]} /> 
            </mesh>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={12}
                position-x={ -26 }
                material={material}
            >
                <planeGeometry args={[12, 100, 1, 1]} /> 
            </mesh>
        </group>

    )
}