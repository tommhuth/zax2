import { useFrame } from "@react-three/fiber"
import { createContext, ReactNode, startTransition, useContext, useMemo } from "react"
import { Vector3 } from "three"
import { Tuple2 } from "../../types.global"
import { store, useStore } from "../../data/store"
import { removeWorldPart } from "../../data/store/world"
import { WORLD_CENTER_X } from "../../data/const"
import { WorldPartType } from "@data/types"

interface WorldPartWrapperProps {
    position: Vector3
    id: string
    children?: ReactNode
    size: Tuple2
    type: WorldPartType
}

interface WorldPartContext {
    position: Vector3
    size: Tuple2
}

let context = createContext<WorldPartContext>({
    position: new Vector3(),
    size: [0, 0]
})

export function useWorldPart() {
    return useContext(context)
}

export default function WorldPartWrapper({
    position,
    children,
    size: [width, depth],
    id,
}: WorldPartWrapperProps) {
    let showColliders = useStore(i => i.debug.showColliders)
    let value = useMemo(() => {
        return {
            position,
            size: [width, depth] as Tuple2
        }
    }, [position, width, depth])

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
        <context.Provider
            value={value}
        >
            {children}

            {showColliders && (
                <mesh
                    position={[WORLD_CENTER_X, -1, position.z + depth / 2]}
                >
                    <boxGeometry args={[width, 2, depth, 1, 1, 1]} />
                    <meshBasicMaterial wireframe color="green" name="debug" />
                </mesh>
            )}
        </context.Provider>
    )
}