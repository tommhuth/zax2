import React, { startTransition, useEffect, useMemo, useState } from "react"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { ColorRepresentation, InstancedMesh as InstancedMeshThree, Vector3 } from "three"
import { Tuple3, Tuple4 } from "../../../types"
import { store, useStore } from "../../../data/store"
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
            startTransition(() => setIndex(instance.index.next()))
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
}

export default function InstancedMesh({
    children,
    receiveShadow = false,
    castShadow = false,
    colors = false,
    visible = true,
    count,
    name,
}: InstancedMeshProps) {
    let colorData = useMemo(() => new Float32Array(count * 3).fill(0), [])
    let [instance, setInstanceRef] = useState<InstancedMeshThree | null>(null)

    useEffect(() => {
        if (!instance || store.getState().instances[name]?.mesh === instance) {
            return
        }

        setInstance(name, instance, count)

        for (let i = 0; i < count; i++) {
            setMatrixAt({ instance: instance, index: i, scale: 0 })
        }
    }, [instance]) 

    return (
        <instancedMesh
            args={[undefined, undefined, count]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            ref={setInstanceRef}
            visible={visible}
            frustumCulled={false}
        >
            {colors ? <instancedBufferAttribute attach="instanceColor" args={[colorData, 3, true]} /> : null}
            {children}
        </instancedMesh>
    )
}