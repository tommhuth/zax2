import { useFrame } from "@react-three/fiber"
import { useStore } from "../data/store"
import { useLayoutEffect, useRef } from "react"
import { Group, MeshBasicMaterial } from "three"
import animate from "@huth/animate"
import { easeInOutQuart } from "../data/shaping"

let material = new MeshBasicMaterial({ color: "#000", name: "edge" })

export default function EdgeOverlay({ ready = false }) {
    let groupRef = useRef<Group>(null)
    let diagonal = useStore(i => i.world.diagonal)

    useFrame(() => {
        let player = useStore.getState().player.object

        if (player && groupRef.current) {
            groupRef.current.position.setZ(player.position.z)
        }
    })

    useLayoutEffect(() => {
        if (!groupRef.current) {
            return
        }

        let xRight = -31
        let xLeft = 13
        let offset = 12

        groupRef.current.children[0].position.x = xRight + offset
        groupRef.current.children[1].position.x = xLeft - offset
 
        if (ready) { 
            return animate({
                from: {
                    xRight: xRight + offset,
                    xLeft: xLeft - offset,
                },
                to: {
                    xLeft,
                    xRight
                },
                easing: easeInOutQuart,
                duration: 2000, 
                render({ xLeft, xRight }) {
                    if (!groupRef.current) {
                        return
                    }

                    groupRef.current.children[0].position.x = xLeft
                    groupRef.current.children[1].position.x = xRight
                },
            })
        }
    }, [ready, diagonal])

    return (
        <group ref={groupRef}>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={13} 
                rotation-y={-.65}
                material={material}
            >
                <planeGeometry args={[22, 100, 1, 1]} />
            </mesh>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={12} 
                material={material}
            >
                <planeGeometry args={[22, 100, 1, 1]} />
            </mesh>
        </group>

    )
}