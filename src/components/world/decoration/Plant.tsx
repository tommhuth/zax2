import { useEffect, useMemo, useRef, useState } from "react"
import { useInstance } from "../models/InstancedMesh"
import { setBufferAttribute, setMatrixAt, setMatrixNullAt } from "../../../data/utils"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { useWorldPart } from "../WorldPartWrapper" 
import { store, useStore } from "../../../data/store"
import { useCollisionDetection } from "../../../data/collisions"
import { Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { createParticles } from "../../../data/store/effects"
import { Owner } from "../../../data/types"

interface PlantProps {
    position: Tuple3
    scale: number
}

export default function Plant({ position: [x,y,z] = [0, 0, 0], scale = 1 }: PlantProps) {
    let [index, instance] = useInstance("plant")
    let partPosition = useWorldPart()  
    let grid = useStore(i => i.world.grid)
    let size: Tuple3 = [5 * scale * .5, 2.75 * scale,  4 * scale * .5]
    let id = useMemo(()=> random.id(), [])
    let [health, setHealth] = useState(40)
    let position = useMemo(( )=> new Vector3(x, y, partPosition[2] + z), [])
    let client = useMemo(() => {
        return grid.createClient(
            position.toArray(), 
            size, 
            { type: "plant", id }
        )
    }, [grid]) 
    let re = useRef(0)

    useCollisionDetection({
        interval: 2,
        position: position,
        size,
        when: () => health > 0,
        actions: {
            bullet: ({client, type, bullet }) => { 
                if (client.data.id === id && type === "plant" && bullet.owner === Owner.PLAYER) {
                    console.log("plant")
                    setHealth(Math.max(health - 10,0))
                }
            },
            player: () => {
                setHealth(Math.max(health - 5,0))
            }
        }
    })

    useEffect(() => {
        if (health === 0 && typeof index === "number") {
            grid.remove(client)
            setMatrixNullAt(instance, index)
            createParticles({
                position: position.toArray(),
                count: [15, 22],
                radius: [.01 * scale, .4],
                normal: [0,1,0],
                spread: [[-.5, .5], [0, 1]],
                speed: [10, 27],
                color: "#00ff9d",
                stagger: [0,0]
            })
        }

        re.current += .4
    }, [health, grid, client])

    useEffect(() => {
        return () => grid.remove(client)
    }, [client, grid])

    useFrame((state, delta)=> {
        let { instances } = store.getState()

        setBufferAttribute(instances.plant.mesh.geometry, "aTrauma", re.current, index)
        re.current *= .7
    })

    useEffect(() => {
        if (typeof index === "number") {
            setMatrixAt({
                instance,
                index,
                scale,
                rotation: [0, random.float(0, Math.PI * 2), 0],
                position: [x, y, partPosition[2] + z],
            })
        }
    }, [index, instance]) 

    return null
}