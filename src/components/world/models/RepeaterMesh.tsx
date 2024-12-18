import React, { cloneElement, useEffect, useRef, useState } from "react"
import { Group, Object3D } from "three"
import { useStore } from "../../../data/store"
import { requestRepeater, createRepeater } from "../../../data/store/utils"
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

    return repeater
}

interface RepeaterMeshProps {
    children: React.ReactNode
    name: RepeaterName
    count: number
}

export default function RepeaterMesh({ name, count, children }: RepeaterMeshProps) {
    let [ref, setRef] = useState<Group | null>(null)

    useEffect(() => {
        if (!ref) {
            return
        }

        createRepeater(name, ref.children, count)
    }, [ref, count, name])

    return (
        <group ref={setRef}>
            {new Array(count).fill(null).map((i, index) => cloneElement(children as any, { key: index }))}
        </group>
    )
}