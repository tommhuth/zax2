import React, { cloneElement, useEffect, useRef, useState } from "react"
import { Group, Object3D } from "three"
import { useStore } from "../../../data/store"
import { requestRepeater, setRepeater } from "../../../data/store/utils"
import { RepeaterName } from "../../../data/types"

export function useRepeater(name: RepeaterName) {
    let [repeater, setRepeater] = useState<Object3D | null>(null)
    let hasRepeater = useRef(false)
    let hasData = !!useStore(i => i.repeaters[name])  

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
    }
}

interface RepeaterMeshProps {
    children: React.ReactNode
    name: RepeaterName
    count: number
}

export default function RepeaterMesh({ name, count, children }: RepeaterMeshProps) {
    let [ref, setRef] = useState<Group | null>(null)
    let ready = useStore(i => i.ready)

    useEffect(() => {
        if (!ref) {
            return
        }

        ref.children.forEach(i => {
            i.traverse(j => {
                j.frustumCulled = ready
            })
        })
    }, [ready])

    useEffect(() => {
        if (!ref) {
            return
        }

        setRepeater(name, ref.children, count)
    }, [ref])

    return (
        <group ref={setRef}>
            {new Array(count).fill(null).map((i, index) => cloneElement(children as any, { key: index }))}
        </group>
    )
}