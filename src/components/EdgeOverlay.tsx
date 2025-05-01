import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { Group, MeshBasicMaterial, PlaneGeometry } from "three"
import animate from "@huth/animate"
import { easeInOutQuart } from "@data/lib/shaping"

let material = new MeshBasicMaterial({ color: "#000", name: "edge" })
let geometry = new PlaneGeometry(22, 150, 1, 1)

export default function EdgeOverlay({ ready = false }) {
    let groupRef = useRef<Group>(null)
    let { camera } = useThree()

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.position.setZ(camera.position.z + 50)
        }
    })

    useLayoutEffect(() => {
        if (!groupRef.current || !ready) {
            return
        }

        let xRight = -31
        let xLeft = 13
        let offset = 12

        groupRef.current.children[0]?.position.setComponent(0, xRight + offset)
        groupRef.current.children[1]?.position.setComponent(0, xLeft - offset)
        groupRef.current.position.setZ(camera.position.z + 50)

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
                groupRef.current?.children[0]?.position.setComponent(0, xLeft)
                groupRef.current?.children[1]?.position.setComponent(0, xRight)
            },
        })
    }, [ready, camera])

    return (
        <group ref={groupRef}>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={13}
                rotation-y={-.65}
                material={material}
                frustumCulled={false}
                geometry={geometry}
            />
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={12}
                material={material}
                frustumCulled={false}
                geometry={geometry}
            />
        </group>
    )
}