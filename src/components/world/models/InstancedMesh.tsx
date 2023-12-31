import React, { useEffect, useMemo, useRef, useState } from "react"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { ColorRepresentation, InstancedMesh as InstancedMeshThree, Vector3 } from "three"
import { Tuple3, Tuple4 } from "../../../types"
import { useStore } from "../../../data/store"
import { setInstance } from "../../../data/store/utils"
import { InstanceName } from "../../../data/types"

interface UseInstanceOptions {
    reset?: boolean
    color?: ColorRepresentation
    scale?: Tuple3 | number
    rotation?: Tuple3 | Tuple4
    position?: Vector3 | Tuple3
}

export function useInstance(name: InstanceName, {
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
    visible?: boolean
    count: number
    name: InstanceName
    userData?: Record<string, any>
}

export default function InstancedMesh({
    children,
    receiveShadow = true,
    castShadow = true,
    colors = true,
    visible = true,
    count,
    name,
    userData = {}
}: InstancedMeshProps) {
    let colorData = useMemo(() => new Float32Array(count * 3).fill(1), [])
    let ref = useRef<InstancedMeshThree | null>(null) 

    useEffect(() => {
        if (!ref.current) {
            console.warn(name, "instance is not available, this is bad")

            return
        }

        setInstance(name, ref.current, count) 

        for (let i = 0; i < count; i++) {
            setMatrixAt({ instance: ref.current, index: i, scale: 0 })
        } 
    }, []) 

    return (
        <instancedMesh
            args={[undefined, undefined, count]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            userData={{ ...userData, type: name }}
            ref={ref} 
            visible={visible} 
        >
            {colors ? <instancedBufferAttribute attach="instanceColor" args={[colorData, 3]} /> : null}
            {children}
        </instancedMesh>
    )
}