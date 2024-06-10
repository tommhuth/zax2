import { useGLTF } from "@react-three/drei"

import model from "@assets/models/rockface.glb"
import { useStore } from "../../../data/store"
import { useEffect, useMemo } from "react"
import random from "@huth/random"
import DebugBox from "@components/DebugBox"
import { Vector3 } from "three"

export function Rockface(props) {
    const { nodes } = useGLTF(model)
    const materials = useStore(i => i.materials)
    const grid = useStore(i => i.world.grid)
    const position = useMemo(()=> new Vector3(...props.position), [])
    const client = useMemo(() => {
        return grid.createClient(props.position, props.scale, {
            type: "building",
            id: random.id(),
        })
    }, [grid])

    useEffect(() => {
        if (!grid || !client) {
            return
        }

        return () => {
            grid.remove(client)
        }
    }, [client, grid])

    return (
        <>
            <mesh
                castShadow
                receiveShadow
                dispose={null}
                geometry={nodes.building4001.geometry}
                material={materials.rock}
                {...props}
            />
            <DebugBox size={props.scale} position={position} />
        </>
    )
}