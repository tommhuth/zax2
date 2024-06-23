import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect, useRef } from "react"
import { Bullet } from "../data/types"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../data/utils"
import { store } from "../data/store"
import { getIntersection, getCollisions, CollisionEventDetails } from "../data/collisions"
import { Tuple3 } from "../types.global"
import { Mesh, Vector3 } from "three"
import { removeBullet } from "@data/store/actors/bullet.actions"
import InstancedMesh from "./world/models/InstancedMesh"
import { damp } from "three/src/math/MathUtils.js"
import { WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "@data/const"
import { setLastImpactLocation } from "@data/store/effects"

function createCollisionEvent(detail: CollisionEventDetails) {
    return new CustomEvent<CollisionEventDetails>("bulletcollision", {
        bubbles: false,
        cancelable: false,
        detail,
    })
}

function BulletHandler() {
    let impactRef = useRef<Mesh>(null)

    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, diagonal }, player } = store.getState()
        let removedBullets: Bullet[] = []

        if (!instances.line || !player.object) {
            return
        }

        for (let bullet of bullets) {
            let collisions = getCollisions({
                grid,
                position: bullet.position.toArray(),
                size: bullet.aabb.getSize(new Vector3()).toArray(),
            })

            for (let client of collisions) {
                let intersection = getIntersection(client, bullet)

                startTransition(() => setLastImpactLocation(...intersection))

                window.dispatchEvent(
                    createCollisionEvent({
                        client,
                        bullet,
                        intersection,
                        normal: bullet.direction.map(i => i * -1) as Tuple3,
                        type: client.data.type
                    })
                )

                break
            }

            bullet.position.x += bullet.direction[0] * bullet.speed * ndelta(delta)
            bullet.position.z += bullet.direction[2] * bullet.speed * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: bullet.position.toArray(),
                rotation: [0, bullet.rotation + Math.PI * .5, 0],
                scale: bullet.size
            })

            if (
                collisions.length
                || bullet.position.z > player.object.position.z + diagonal
                || bullet.position.z < player.object.position.z - diagonal * .75
                || bullet.position.x > WORLD_LEFT_EDGE * 3
                || bullet.position.x < WORLD_RIGHT_EDGE * 2
            ) {
                removedBullets.push(bullet)
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }
        }

        for (let bullet of removedBullets) {
            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removedBullets.length) {
            startTransition(() => removeBullet(...removedBullets.map(i => i.id)))
        }
    })

    // impact animation
    useEffect(() => {
        return store.subscribe(
            state => state.effects.lastImpactLocation,
            lastImpactLocation => {
                impactRef.current?.scale.set(1, 1, 1)
                impactRef.current?.position.set(...lastImpactLocation)
            }
        )
    }, [])

    useFrame((state, delta) => {
        if (impactRef.current) {
            for (let prop of ["x", "y", "z"] as const) {
                impactRef.current.scale[prop] = damp(impactRef.current.scale[prop], 0, 6, ndelta(delta))
            }
        }
    })

    return (
        <>
            <mesh ref={impactRef}>
                <sphereGeometry args={[.5, 16, 16]} />
                <meshBasicMaterial name="solidWhite" color={"white"} />
            </mesh>

            <InstancedMesh
                castShadow
                name="line"
                count={40}
                colors={false}
            >
                <cylinderGeometry
                    args={[1, 1, 1, 8, 1]}
                    attach="geometry"
                    onUpdate={(e) => {
                        e.rotateX(Math.PI * .5)
                    }}
                />
                <meshBasicMaterial
                    name="line"
                    color={"white"}
                />
            </InstancedMesh>
        </>
    )
}

export default memo(BulletHandler)