import { startTransition, useEffect, useMemo, useState } from "react"
import { Vector3 } from "three"
import { Barrel, InstanceName, Owner } from "../../../data/types"
import { useInstance } from "../models/InstancedMesh"
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { createExplosion, createImpactDecal, createParticles, createScrap } from "../../../data/store/effects"
import { damageBarrel, removeBarrel } from "../../../data/store/world"
import { barellParticleColor } from "../../../data/theme"
import { increaseScore } from "../../../data/store/player"
import { useCollisionDetection } from "../../../data/collisions"
import Config from "../../../data/Config"
import { useRemoveWhenBehind } from "../../../data/hooks" 

function explode(position: Vector3, size: Tuple3, color: string) {
    createExplosion({
        position: [position.x, .5, position.z],
        count: 10,
        radius: random.float(.65, .75),
        fireballPath: [[position.x, 1, position.z], [0, 4, 0]],
        fireballCount: random.pick(6, 0),
    })
    createParticles({
        position: [position.x, .5, position.z],
        offset: [[-.5, .5], [0, .5], [-.5, .5]],
        speed: [5, 25],
        normal: [0, 1, 0],
        spread: [[-1, 1], [.5, 2]],
        count: [15, 20],
        radius: [.1, .4],
        color,
        stagger: [-150, 0]
    })
    createImpactDecal([position.x, 0, position.z])
    createScrap([position.x, position.y - size[1] * .65, position.z], 2, color)
}

export default function Barrel({
    position, 
    size = [1, 2, 1],
    id,
    health,
}: Barrel) { 
    let [rotation] = useState(random.pick(
        ...new Array(8 * 2)
            .fill(null)
            .map((i, index, list) => (index / list.length) * Math.PI * 2)
    ))
    let model: InstanceName = useMemo(() => {
        return random.pick("barrel1", "barrel2", "barrel3", "barrel4")
    }, [])
    let remove = () => {
        setTimeout(() => startTransition(() => removeBarrel(id)), 300) 
    }

    useInstance(model, {
        position: [position.x, position.y - size[1] / 2, position.z],
        rotation: [0, rotation, 0], 
    })

    useRemoveWhenBehind(position, remove)

    useCollisionDetection({
        actions: {
            bullet: ({ bullet, client, type }) => {
                if (bullet.owner !== Owner.PLAYER || client.data.id !== id || type !== "barrel") {
                    return
                }

                damageBarrel(id, 100)
                increaseScore(1000)  
            }
        }
    })

    useEffect(() => {
        if (health === 0) {
            startTransition(() => {
                remove()
                explode(position, size, barellParticleColor)
            })
        }
    }, [health]) 

    if (!Config.DEBUG) {
        return null
    }

    return (
        <mesh position={position.toArray()}>
            <boxGeometry args={[...size, 1, 1, 1]} />
            <meshBasicMaterial wireframe color="orange" name="debug" />
        </mesh>
    )
}