import { useFrame } from "@react-three/fiber"
import React, { createContext, startTransition, useContext, useMemo } from "react"
import { Vector3 } from "three"
import { Tuple2, Tuple3 } from "../../types.global"
import { store, useStore } from "../../data/store"
import { removeWorldPart } from "../../data/store/world"
import { WORLD_CENTER_X } from "../../data/const"

interface WorldPartWrapperProps {
    position: Vector3
    id: string
    children?: React.ReactNode
    size: Tuple2
}

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
    let showColliders = useStore(i => i.debug.showColliders)
    let sharedPosition = useMemo(() => position.toArray(), [position])

    useFrame(() => {
        let { player, ready, world } = store.getState()
        let buffer = world.diagonal * .75

        if (!ready || !player.object) {
            return
        }

        if (position.z + depth < player.object.position.z - buffer) {
            startTransition(() => removeWorldPart(id))
        }
    })

    return (
        <>
            <context.Provider
                value={sharedPosition}
            >
                {children}

                {showColliders && (
                    <mesh
                        position-y={-1}
                        position-z={position.z + depth / 2}
                        position-x={WORLD_CENTER_X}
                    >
                        <boxGeometry args={[width, 2, depth, 1, 1, 1]} />
                        <meshBasicMaterial wireframe color="green" name="debug" />
                    </mesh>
                )}
            </context.Provider>
        </>
    )
}