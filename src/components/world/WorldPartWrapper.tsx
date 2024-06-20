import { useFrame } from "@react-three/fiber"
import React, { createContext, startTransition, useContext, useMemo, useState } from "react"
import { Box3, Vector3 } from "three"
import { Tuple2, Tuple3 } from "../../types.global"
import { Only } from "../../data/utils"
import { store, useStore } from "../../data/store"
import { removeWorldPart } from "../../data/store/world"
import { WORLD_CENTER_X } from "../../data/const"

interface WorldPartWrapperProps {
    position: Vector3
    id: string
    children?: React.ReactNode
    size: Tuple2
}

let _box = new Box3()
let _center = new Vector3()
let _size = new Vector3()

let context = createContext<Tuple3>([0, 0, 0])

export function useWorldPart() {
    return useContext(context)
}

export function RootWorld({ children }) {
    return (
        <context.Provider value={[0, 0, 0]}>
            {children}
        </context.Provider>
    )
}

export default function WorldPartWrapper({
    position,
    children,
    size: [width, depth],
    id,
}: WorldPartWrapperProps) {
    let [removed, setRemoved] = useState(false)
    let showColliders = useStore(i => i.debug.showColliders)
    let sharedPosition = useMemo(() => position.toArray(), [position])

    useFrame(() => {
        let { player, world, ready } = store.getState()

        if (removed || !ready || !player.object || position.z + depth > player.object.position.z) {
            return
        }

        let height = 1

        _center.set(position.x, position.y + height / 2, position.z + depth / 2)
        _box.setFromCenterAndSize(_center, _size.set(width, height, depth))

        if (!world.frustum.intersectsBox(_box)) {
            setRemoved(true)
            startTransition(() => removeWorldPart(id))
        }
    })

    return (
        <>
            <context.Provider
                value={sharedPosition}
            >
                {children}

                <Only if={showColliders}>
                    <mesh
                        position-y={-1}
                        position-z={position.z + depth / 2}
                        position-x={WORLD_CENTER_X}
                    >
                        <boxGeometry args={[width, 2, depth, 1, 1, 1]} />
                        <meshBasicMaterial wireframe color="green" name="debug" />
                    </mesh>
                </Only>
            </context.Provider>
        </>
    )
}