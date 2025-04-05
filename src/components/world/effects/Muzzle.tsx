import { ComponentPropsWithRef, forwardRef, useImperativeHandle, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { ndelta } from "../../../data/utils"
import random from "@huth/random"
import { Group, SphereGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"
import { whiteMaterial } from "@data/const"

export type MuzzleRef = { activate: () => void }

let geometry = new SphereGeometry(1, 6, 6)


interface MuzzleProps extends ComponentPropsWithRef<"group"> {
    decay?: number
}

export default forwardRef<MuzzleRef, MuzzleProps>(({ decay = 0, ...props }, ref) => {
    let groupRef = useRef<Group>(null)

    useImperativeHandle(ref, () => {
        return {
            activate: () => {
                if (groupRef.current) {
                    for (let child of groupRef.current.children) {
                        let size = random.float(.25, .65)
                        let offset = 1 - (size - .25) / .5

                        child.scale.setScalar(size)
                        child.position.x = random.float(-.5, .5) * offset
                        child.position.z = random.float(-.5, .5) * offset
                        child.position.y = random.float(-.25, .25) * offset
                    }
                }
            }
        }
    }, [])

    useFrame((state, delta) => {
        if (!groupRef.current) {
            return
        }

        for (let i = 0; i < groupRef.current.children.length; i++) {
            let child = groupRef.current.children[i]

            child.scale.x = damp(child.scale.x, 0, i + 2 + decay, ndelta(delta))
            child.scale.y = damp(child.scale.y, 0, i + 2 + decay, ndelta(delta))
            child.scale.z = damp(child.scale.z, 0, i + 2 + decay, ndelta(delta))

            child.position.x += child.scale.x * 10 * ndelta(delta)

            if (child.scale.lengthSq() < .015) {
                child.scale.setScalar(0)
            }
        }
    })

    return (
        <group
            ref={groupRef}
            {...props}
        >
            {Array.from({ length: 8 }).map((i, index) => {
                return (
                    <mesh
                        key={index}
                        castShadow
                        geometry={geometry}
                        material={whiteMaterial}
                    />
                )
            })}
        </group>
    )
})