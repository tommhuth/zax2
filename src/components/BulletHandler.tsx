import { useFrame } from "@react-three/fiber"
import { memo, startTransition, useEffect, useRef } from "react"
import { Bullet } from "../data/types"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../data/utils"
import { store, useStore } from "../data/store"
import { removeBullet } from "../data/store/actors"
import { getIntersection, getCollisions, CollisionEventDetails } from "../data/collisions"
import { Tuple3 } from "../types"
import { Mesh } from "three" 
import { setLastImpactLocation } from "../data/store/world"

function createCollisionEvent( 
    detail: CollisionEventDetails
) {
    return new CustomEvent<CollisionEventDetails>("bulletcollision", {
        bubbles: false,
        cancelable: false,
        detail,
    })
}


function BulletHandler() {
    let lastImpactLocation = useStore(i => i.world.lastImpactLocation)
    let impactRef = useRef<Mesh>(null)

    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, frustum }, player } = store.getState()
        let removedBullets: Bullet[] = []

        if (!instances.line || !player.object || !instances.device) {
            return
        }

        for (let bullet of bullets) {
            let collisions = getCollisions({
                grid, 
                position: bullet.position,
                size: bullet.obb, 
            })

            for (let client of collisions) {
                let intersection = getIntersection(client, bullet)

                setLastImpactLocation(...intersection) 

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
                scale: [bullet.size[0], .1, bullet.size[2]]
            })

            if (!frustum.containsPoint(bullet.position) || collisions.length) {
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
    useFrame(() => {
        if (impactRef.current) {
            impactRef.current.scale.x += (0 - impactRef.current.scale.x) * .15
            impactRef.current.scale.y += (0 - impactRef.current.scale.y) * .15
            impactRef.current.scale.z += (0 - impactRef.current.scale.z) * .15
        }
    }) 

    useEffect(() => {
        impactRef.current?.scale.set(1, 1, 1)
        impactRef.current?.position.set(...lastImpactLocation)
    }, [lastImpactLocation])

    return ( 
        <mesh ref={impactRef}>
            <sphereGeometry args={[.5, 16, 16]} />
            <meshBasicMaterial name="solidWhite" color={"white"} />
        </mesh>
    )
}

export default memo(BulletHandler)