import { ReactNode, startTransition, useEffect, useMemo, useState } from "react"
import { setColorAt, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import { BufferGeometry, ColorRepresentation, InstancedMesh as InstancedMeshThree, Material } from "three"
import { Tuple3, Tuple4 } from "../../../types.global"
import { store, useStore } from "../../../data/store"
import { setInstance } from "../../../data/store/utils"
import { InstanceName } from "../../../data/types"

interface UseInstanceOptions {
    reset?: boolean
    color?: ColorRepresentation
    scale?: number
    rotation?: Tuple3 | Tuple4
    position?: Tuple3
}

export function useInstance(name: InstanceName, {
    reset = true,
    color,
    scale,
    rotation = [0, 0, 0],
    position = [0, 0, 0],
}: UseInstanceOptions = {}) {
    let instance = useStore(i => i.instances[name])
    let [index, setIndex] = useState<null | number>(null)

    useEffect(() => {
        if (instance) {
            startTransition(() => setIndex(instance.index.next()))
        }
    }, [instance])

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setMatrixAt({
                instance: instance.mesh,
                index,
                position,
                scale,
                rotation,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, ...rotation, ...position, scale, instance])

    useEffect(() => {
        if (typeof index === "number" && instance && reset) {
            return () => {
                setMatrixNullAt(instance.mesh, index as number)
            }
        }
    }, [index, instance, reset])

    useEffect(() => {
        if (instance && typeof index === "number" && color) {
            setColorAt(instance.mesh, index, color)
        }
    }, [index, color, instance])

    return [index, instance?.mesh] as const
}

interface InstancedMeshProps {
    children?: ReactNode
    receiveShadow?: boolean
    castShadow?: boolean
    colors?: boolean
    visible?: boolean
    count: number
    name: InstanceName
    renderOrder?: number
    geometry?: BufferGeometry
    material?: Material
}

export default function InstancedMesh({
    children,
    receiveShadow = false,
    castShadow = false,
    colors = false,
    visible = true,
    count,
    name,
    renderOrder,
    geometry,
    material
}: InstancedMeshProps) {
    let colorData = useMemo(() => new Float32Array(count * 3).fill(0), [count])
    let [instance, setInstanceRef] = useState<InstancedMeshThree | null>(null)
    let attempts = useStore(i => i.player.attempts)

    useEffect(() => {
        if (!instance) {
            return
        }

        for (let i = 0; i < count; i++) {
            setMatrixNullAt(instance, i)
        }
    }, [attempts, count, instance])

    useEffect(() => {
        if (!instance || store.getState().instances[name]?.mesh === instance) {
            return
        }

        setInstance(name, instance, count)
    }, [count, instance, name])

    return (
        <instancedMesh
            args={[geometry, material, count]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            ref={setInstanceRef}
            visible={visible}
            frustumCulled={false}
            renderOrder={renderOrder}
        >
            {colors && (
                <instancedBufferAttribute
                    attach="instanceColor"
                    args={[colorData, 3, false]}
                />
            )}
            {children}
        </instancedMesh>
    )
}