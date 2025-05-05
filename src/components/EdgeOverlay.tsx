import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { Group, PlaneGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"
import { ndelta } from "@data/utils"
import { Tuple2 } from "src/types.global"
import { useStore } from "@data/store"

let edgeWidth = 25
let geometry = new PlaneGeometry(edgeWidth, 200, 1, 1)
let xLeft = edgeWidth * .45
let xRight = -edgeWidth * .45
let gap = 10
let baseOffset = -21
let y = 20
let positions: Tuple2 = [baseOffset + xLeft, baseOffset + xRight]

export default function EdgeOverlay({ open = false }: { open: boolean }) {
    let groupRef = useRef<Group>(null)
    let { camera } = useThree()
    let materials = useStore(i => i.materials)

    useLayoutEffect(() => {
        for (let [index, position] of positions.entries()) {
            let element = groupRef.current?.children[index]

            if (!element) {
                break
            }

            element.position.x = position
        }
    }, [])

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.position.setZ(camera.position.z + 50)
        }
    })

    useFrame((state, delta) => {
        for (let [index, position] of positions.entries()) {
            let element = groupRef.current?.children[index]

            if (!element) {
                break
            }

            element.position.x = damp(
                element.position.x,
                position + (open ? (1 - index * 2) * gap : 0),
                2.5,
                ndelta(delta, true)
            )
        }
    })

    return (
        <group ref={groupRef}>
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={y}
                material={materials.black}
                frustumCulled={false}
                geometry={geometry}
            />
            <mesh
                rotation-x={-Math.PI / 2}
                position-y={y}
                material={materials.black}
                frustumCulled={false}
                geometry={geometry}
            />
        </group>
    )
}