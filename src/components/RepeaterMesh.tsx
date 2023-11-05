import React, { cloneElement, useCallback, useEffect, useRef, useState } from "react"
import { Group, Object3D } from "three"
import { useStore } from "../data/store"
import { requestRepeater, setRepeater } from "../data/store/utils"
import { RepeaterName } from "../data/types"

export function useRepeater(name: RepeaterName) {
    let [repeater, setRepeater] = useState<Object3D | null>(null)
    let hasRepeater = useRef(false)
    let hasData = !!useStore(i => i.repeaters[name])
    let release = useCallback(() => {
        if (!repeater) {
            return
        }

        // repeater.visible = false
        // repeater.position.set(0, 0, 100_000)
    }, [repeater])

    useEffect(() => {
        if (repeater) {
            return () => release()
        }
    }, [repeater, release])

    useEffect(() => {
        if (!hasRepeater.current && hasData) {
            setRepeater(requestRepeater(name))
            hasRepeater.current = true
        }
    }, [hasData])

    if (!repeater) {
        return null
    }

    return {
        mesh: repeater,
        release
    }
} 

interface RepeaterMeshProps {
    children: React.ReactNode
    name: RepeaterName
    count: number
}

export default function RepeaterMesh({ name, count, children }: RepeaterMeshProps) { 
    let ref = useRef<Group>(null)

    useEffect(() => {
        if (!ref.current) {
            return
        } 

        ref.current.children.forEach(i => {
            i.visible = false
        }) 

        setRepeater(name, ref.current.children, count)
    }, [])

    return (
        <group ref={ref}>
            {new Array(count).fill(null).map((i, index) => cloneElement(children as any, { key: index }))}
        </group>
    )
}