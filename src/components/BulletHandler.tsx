import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect, useRef } from "react"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../data/utils"
import { store, useStore } from "../data/store"
import { getIntersection, getBulletCollisions, dispatchCollisionEvent } from "../data/collisions"
import { Tuple3 } from "../types.global"
import { CylinderGeometry, Mesh } from "three"
import { removeBullet } from "@data/store/actors/bullet.actions"
import InstancedMesh from "./world/models/InstancedMesh"
import { damp } from "three/src/math/MathUtils.js"
import { setLastImpactLocation } from "@data/store/effects"
import { BULLET_SIZE } from "@data/const"


const geometry = new CylinderGeometry(1, 1, 1, 10, 1)

geometry.rotateX(Math.PI * .5)

function BulletHandler() {
    let impactRef = useRef<Mesh>(null)
    let materials = useStore(i => i.materials)

    useFrame((state, delta) => {
        let { instances, world: { bullets, frustum }, player } = store.getState()
        let removedBulletIds: string[] = []

        if (!instances.line || !player.object) {
            return
        }

        for (let bullet of bullets) {
            let collisions = getBulletCollisions(bullet)

            for (let client of collisions) {
                let intersection = getIntersection(client, bullet.line)

                startTransition(() => {
                    setLastImpactLocation(...intersection)
                    dispatchCollisionEvent({
                        client,
                        bullet,
                        intersection,
                        normal: bullet.line.direction.toArray().map(i => i * -1) as Tuple3,
                        type: client.data.type
                    })
                })

                break
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }

            bullet.line.position.x += bullet.line.direction.x * bullet.speed * ndelta(delta)
            bullet.line.position.z += bullet.line.direction.z * bullet.speed * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: bullet.line.position.toArray(),
                rotation: [0, bullet.rotation, 0],
                scale: [BULLET_SIZE, .1, .1]
            })

            if (collisions.length || !frustum.containsPoint(bullet.line.position)) {
                removedBulletIds.push(bullet.id)
                setMatrixNullAt(instances.line.mesh, bullet.index)
            }
        }

        if (removedBulletIds.length) {
            startTransition(() => removeBullet(removedBulletIds))
        }
    })

    // impact animation
    useEffect(() => {
        return store.subscribe(
            state => state.effects.lastImpactLocation,
            lastImpactLocation => {
                impactRef.current?.scale.setScalar(1)
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
                <primitive
                    object={geometry}
                    attach="geometry"
                />
                <primitive
                    attach="material"
                    object={materials.white}
                />
            </InstancedMesh>
        </>
    )
}

export default memo(BulletHandler)