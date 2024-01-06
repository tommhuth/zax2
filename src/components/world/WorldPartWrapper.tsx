import { useFrame } from "@react-three/fiber"
import React, { createContext, startTransition, useContext, useMemo, useRef } from "react"
import { Box3, Vector3 } from "three"
import { Tuple2, Tuple3 } from "../../types"
import { Only } from "../../data/utils"
import random from "@huth/random"
import { WORLD_CENTER_X } from "./World"
import Config from "../../data/Config"
import { store } from "../../data/store"
import { removeWorldPart } from "../../data/store/world"

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
    let dead = useRef(false)
    let i = useRef(random.integer(0, 100))
    let p = useMemo(() => position.toArray(), [position])

    useFrame(() => {
        i.current++

        if (dead.current || i.current % 20 > 0 || !store.getState().loaded) {
            return
        }

        let { player, world } = store.getState()
        let height = 6

        _center.set(position.x, position.y + height / 2, position.z + depth / 2)
        _box.setFromCenterAndSize(_center, _size.set(width, height, depth))

        if (!world.frustum.intersectsBox(_box) && player.object && position.z + depth < player.object.position.z) {
            dead.current = true
            startTransition(() => removeWorldPart(id))
        }
    })

    return (
        <>
            <context.Provider
                value={p}
            >
                {children}

                <Only if={Config.DEBUG}>
                    <mesh
                        position-y={-1}
                        position-z={position.z + depth / 2}
                        position-x={WORLD_CENTER_X}
                    >
                        <boxGeometry args={[width, 2, depth, 1, 1, 1]} />
                        <meshBasicMaterial wireframe color="green" />
                    </mesh>
                </Only>
            </context.Provider>
        </>
    )
}