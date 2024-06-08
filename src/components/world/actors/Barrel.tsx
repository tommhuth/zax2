import { startTransition, useEffect, useMemo, useState } from "react"
import { Vector3 } from "three"
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
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"
import { useStore } from "../../../data/store"

import barrelsModel from "@assets/models/barrels.glb"
import { useGLTF } from "@react-three/drei"

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

const rotations = new Array(8 * 2)
    .fill(null)
    .map((i, index, list) => (index / list.length) * Math.PI * 2)

type GLTFResult = GLTF & {
    nodes: {
        barrel4: THREE.Mesh
        barrel2: THREE.Mesh
        barrel3: THREE.Mesh
        barrel1: THREE.Mesh
    }
}

export default function Barrel({
    position,
    size,
    id,
    health,
}: BarrelType) {
    let type = useMemo(() => random.pick("barrel1", "barrel2", "barrel3", "barrel4"), [])
    let { nodes } = useGLTF(barrelsModel) as GLTFResult
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
            <group
                castShadow
                receiveShadow
                position={[position.x, position.y - size[1] / 2, position.z]}
                rotation-y={rotation}
                dispose={null}
            >
                <mesh
                    geometry={nodes.barrel1.geometry}
                    material={materials.barrel}
                    visible={type === "barrel1"}
                />
                <mesh
                    geometry={nodes.barrel2.geometry}
                    material={materials.barrel}
                    visible={type === "barrel2"}
                />
                <mesh
                    geometry={nodes.barrel3.geometry}
                    material={materials.barrel}
                    visible={type === "barrel3"}
                />
                <mesh
                    geometry={nodes.barrel4.geometry}
                    material={materials.barrel}
                    visible={type === "barrel4"}
                />
            </group>

            {Config.DEBUG && (
                <mesh position={position.toArray()}>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial wireframe color="orange" name="debug" />
                </mesh>
            )}
        </>
    )
}