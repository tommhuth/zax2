import { ComponentPropsWithRef, forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { list, ndelta, setMatrixAt } from "../../../data/utils"
import random from "@huth/random"
import { InstancedMesh, SphereGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"
import { useStore } from "@data/store"
import { Tuple3 } from "src/types.global"

export type MuzzleRef = { activate: () => void }

let geometry = new SphereGeometry(1, 6, 6)

interface MuzzleProps extends ComponentPropsWithRef<"instancedMesh"> {
    decay?: number
}

interface Smoke {
    scale: number
    index: number
    position: Tuple3
}

export default forwardRef<MuzzleRef, MuzzleProps>(({ decay = 0, ...props }, ref) => {
    let instanceRef = useRef<InstancedMesh>(null)
    let materials = useStore(i => i.materials)
    let count = 8
    let smokes = useMemo<Smoke[]>(() => {
        return list(count).map(index => {
            return {
                index,
                scale: 0,
                position: [0, 0, 0]
            } satisfies Smoke
        })
    }, [count])


    useImperativeHandle(ref, () => {
        return {
            activate: () => {
                for (let smoke of smokes) {
                    let size = random.float(.25, .65)
                    let offset = 1 - (size - .25) / .5

                    smoke.scale = size
                    smoke.position[0] = random.float(-.5, .5) * offset
                    smoke.position[1] = random.float(-.5, .5) * offset
                    smoke.position[2] = random.float(-.25, .25) * offset
                }
            }
        }
    }, [smokes])

    useFrame((state, delta) => {
        if (!instanceRef.current) {
            return
        }

        for (let smoke of smokes) {
            setMatrixAt({
                index: smoke.index,
                scale: smoke.scale,
                instance: instanceRef.current,
                position: smoke.position
            })

            smoke.scale = damp(smoke.scale, 0, smoke.index + 2 + decay, ndelta(delta))
            smoke.position[0] += smoke.scale * 10 * ndelta(delta)

            if (smoke.scale < .01) {
                smoke.scale = 0
            }
        }
    })

    return (
        <instancedMesh
            castShadow
            receiveShadow
            args={[geometry, materials.muzzle, count]}
            ref={instanceRef}
            {...props}
        />
    )
}) 