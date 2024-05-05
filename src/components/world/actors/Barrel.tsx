import { startTransition, useEffect, useMemo, useState } from "react"
import { Mesh, Vector3 } from "three"
import { Barrel as BarrelType, Owner } from "../../../data/types" 
import random from "@huth/random"
import { Tuple3 } from "../../../types"
import { createExplosion, createImpactDecal, createParticles, createScrap } from "../../../data/store/effects"
import { damageBarrel, removeBarrel } from "../../../data/store/world"
import { barellParticleColor } from "../../../data/theme"
import { increaseScore } from "../../../data/store/player"
import { useCollisionDetection } from "../../../data/collisions"
import Config from "../../../data/Config"
import { useRemoveWhenBehindPlayer } from "../../../data/hooks" 
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js" 
import { useStore } from "../../../data/store"

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

useLoader.preload(GLTFLoader,[
    "/models/barrel1.glb",
    "/models/barrel2.glb",
    "/models/barrel3.glb",
    "/models/barrel4.glb",
])

const rotations = new Array(8 * 2)
    .fill(null)
    .map((i, index, list) => (index / list.length) * Math.PI * 2)

export default function Barrel({
    position, 
    size = [1, 2, 1],
    id,
    health,
}: BarrelType) { 
    let type = useMemo(() => random.pick("barrel1", "barrel2", "barrel3", "barrel4"), []) 
    let model = useLoader(GLTFLoader, `/models/${type}.glb`)
    let [rotation] = useState(random.pick(...rotations))
    let materials = useStore(i => i.materials)
    let remove = () => {
        setTimeout(() => {
            startTransition(() => removeBarrel(id))
        }, 300) 
    }  

    useRemoveWhenBehindPlayer(position, remove)

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
 
    return (
        <>
            <mesh 
                castShadow
                receiveShadow
                position={[position.x, position.y - size[1] / 2, position.z]}
                rotation-y={rotation}
            >
                <primitive
                    object={(model.nodes[type] as Mesh).geometry}
                    dispose={null}
                    attach="geometry"
                />
                <primitive object={materials.barrel} attach="material" />
            </mesh>

            {Config.DEBUG && (
                <mesh position={position.toArray()}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial wireframe color="orange" name="debug" />
                </mesh>
            )}
        </> 
    )
}