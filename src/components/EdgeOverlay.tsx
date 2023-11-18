import { useFrame } from "@react-three/fiber"
import { useStore } from "../data/store"
import { useLayoutEffect, useRef } from "react"
import { Group } from "three"
import animate from "@huth/animate"
import { easeOutCubic } from "../data/shaping"


export default function EdgeOverlay() {
    let groupRef = useRef<Group>(null)
    let state = useStore(i => i.state)

    useLayoutEffect(() => {
        groupRef.current.children[0].position.x = 16
        groupRef.current.children[1].position.x = -36

        if (state === "running") {
            animate({
                from: { left: 16, right: -36 },
                to: { left: 6, right: -26 },
                duration: 600,
                easing: easeOutCubic,
                render({ left, right }) {
                    groupRef.current.children[0].position.x = left
                    groupRef.current.children[1].position.x = right
                }
            })
        }
    }, [state])

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