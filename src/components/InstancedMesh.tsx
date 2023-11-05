import React, { useCallback, useEffect, useMemo, useState } from "react"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../data/utils"
import { ColorRepresentation, InstancedMesh as InstancedMeshThree, Vector3 } from "three"
import { Tuple3, Tuple4 } from "../types"
import { useStore } from "../data/store"
import { setInstance } from "../data/store/utils"
import { InstancedName } from "../data/types"

interface UseInstanceOptions {
    reset?: boolean
    color?: ColorRepresentation
    scale?: Tuple3 | number
    rotation?: Tuple3 | Tuple4
    position?: Vector3 | Tuple3
}

export function useInstance(name: InstancedName, {
    reset = true,
    color,
    scale,
    rotation,
    position
}: UseInstanceOptions = {}) {
    let instance = useStore(i => i.instances[name])
    let [index, setIndex] = useState<null | number>(null)

    useEffect(() => {
        if (typeof index === "number" && instance && (position || rotation || scale)) {
            setMatrixAt({
                instance: instance.mesh,
                index,
                position: position instanceof Vector3 ? position.toArray() : position,
                scale,
                rotation,
            })
        }
    }, [index, instance])

    useEffect(() => {
        if (instance) {
            setIndex(instance.index.next())
        }
    }, [instance])

    useEffect(() => {
        if (typeof index === "number" && instance && reset) {
            return () => {
                setMatrixNullAt(instance.mesh, index as number)
            }
        }
    }, [index, instance])

    useEffect(() => {
        if (instance && typeof index === "number" && color) {
            setColorAt(instance.mesh, index, color)
        }
    }, [index, color, instance])

    return [index, instance?.mesh] as const
}

interface InstancedMeshProps {
    children: React.ReactNode
    receiveShadow?: boolean
    castShadow?: boolean
    colors?: boolean
    count: number
    name: InstancedName
    userData?: Record<string, any>
}

export default function InstancedMesh({
    children,
    receiveShadow = true,
    castShadow = true,
    colors = true,
    count,
    name,
    userData = {}
}: InstancedMeshProps) {
    let colorData = useMemo(() => new Float32Array(count * 3).fill(1), [])
    let handleRef = useCallback((mesh: InstancedMeshThree) => {
        if (mesh) {
            setInstance(name, mesh, count)

            for (let i = 0; i < count; i++) {
                setMatrixAt({ instance: mesh, index: i, scale: 0 })
            }
        }
    }, [])

    return (
        <instancedMesh
            args={[undefined, undefined, count]}
            castShadow={castShadow}
            userData={{ ...userData, type: name }}
            receiveShadow={receiveShadow}
            ref={handleRef}
            frustumCulled={false}
        >
            {colors ? <instancedBufferAttribute attach="instanceColor" args={[colorData, 3]} /> : null}
            {children}
        </instancedMesh>
    )
}