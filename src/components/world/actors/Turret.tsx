import { memo, startTransition, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { clamp, ndelta } from "../../../data/utils"
import random from "@huth/random"
import { Mesh, Vector3 } from "three"
import { Owner, Turret as TurretType } from "../../../data/types"
import { GLTF } from "three-stdlib"
import { Tuple3 } from "../../../types"
import { createBullet, damageTurret, removeTurret } from "../../../data/store/actors"
import { store, useStore } from "../../../data/store"
import { createExplosion, createImpactDecal, createParticles, createScrap } from "../../../data/store/effects"
import { turretColor, turretParticleColor } from "../../../data/theme"
import { useCollisionDetection } from "../../../data/collisions"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../../../data/const"
import { useRemoveWhenBehind } from "../../../data/hooks"
import { useGLTF } from "@react-three/drei"
import { damp } from "three/src/math/MathUtils.js"
import Config from "../../../data/Config"

function explode(position: Vector3, size: Tuple3) {
    createExplosion({
        position: [
            position.x,
            position.y + size[1] * .15,
            position.z,
        ],
        count: 14,
        radius: random.float(.6, .7),
    })
    createParticles({
        position: position.toArray(),
        offset: [[-.5, .5], [0, .5], [-.5, .5]],
        speed: [5, 25],
        spread: [[-1, 1], [.5, 2]],
        normal: [0, 1, 0],
        count: [16, 20],
        radius: [.05, .4],
        stagger: [-150, 0],
        color: turretParticleColor,
    })
}


type GLTFResult = GLTF & {
    nodes: {
        Cylinder: THREE.Mesh
        Cylinder_1: THREE.Mesh
    }
}

useGLTF.preload("/models/turret2.glb")

function Turret({ id, size, position, health, fireFrequency, rotation, floorLevel }: TurretType) {
    let { nodes } = useGLTF("/models/turret2.glb") as GLTFResult
    let diagonal = useStore(i => i.world.diagonal)
    let materials = useStore(i => i.materials)
    let shootTimer = useRef(0)
    let barrellRef = useRef<Mesh>(null)
    let nextShotAt = useRef(fireFrequency)
    let remove = () => {
        setTimeout(() => startTransition(() => removeTurret(id)), 350)
    } 

    useRemoveWhenBehind(position, remove)

    useCollisionDetection({
        actions: {
            bullet: ({ bullet, client, type }) => {
                if (bullet.owner !== Owner.PLAYER || client.data.id !== id || type !== "turret") {
                    return
                }

                createParticles({
                    position: position.toArray(),
                    offset: [[-.5, .5], [0, .5], [-.5, .5]],
                    speed: [5, 25],
                    spread: [[0, .5], [.5, 2]],
                    normal: [0, 1, -1],
                    count: [3, 5],
                    radius: [.05, .2],
                    stagger: [0, 0],
                    color: turretParticleColor,
                })
                damageTurret(id, bullet.damage)
            }
        }
    })

    useEffect(() => {
        if (health === 0) {
            startTransition(() => {
                remove()
                explode(position, size)
                createImpactDecal([position.x, .1, position.z])
                createScrap([position.x, floorLevel, position.z], 2, turretColor)
            })
        }
    }, [health])

    // shooting
    useFrame((state, delta) => {
        let { player: { object: playerObject }, world } = store.getState()
        let canShoot = world.frustum.containsPoint(position) && health > 0

        if (shootTimer.current > nextShotAt.current && canShoot && playerObject) {
            let playerPosition = playerObject.position
            let distanceFromPlayer = 1 - clamp(Math.abs(playerPosition.z - playerPosition.z) / (diagonal / 2), 0, 1)
            let heightPenalty = clamp((playerPosition.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE), 0, 1)

            let offsetRadius = size[0] + 1.35
            let offsetx = Math.cos(rotation) * offsetRadius
            let offsetz = Math.sin(rotation) * offsetRadius
            let bulletSpeed = 18

            startTransition(() => {
                createBullet({
                    position: [
                        position.x + offsetx,
                        position.y + 1.8,
                        position.z + offsetz
                    ],
                    damage: 5,
                    speed: bulletSpeed,
                    rotation: rotation,
                    owner: Owner.ENEMY
                })
            })

            shootTimer.current = 0
            nextShotAt.current = fireFrequency * random.float(.75, 1)
                - fireFrequency * distanceFromPlayer * .5
                + heightPenalty * fireFrequency * 2

            if (barrellRef.current) {
                barrellRef.current.position.z = -.5
            }
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    useFrame((state, delta) => {
        if (!barrellRef.current) {
            return
        }

        barrellRef.current.position.z = damp(barrellRef.current.position.z, 0, 1.5, ndelta(delta))
    })

    return (
        <group
            dispose={null}
            position={position.toArray()}
            rotation={[0, -rotation + Math.PI * .5, 0]}
        >
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder.geometry}
                    material={materials.turret}
                />
                {/* barrell */}
                <mesh
                    castShadow
                    receiveShadow
                    ref={barrellRef}
                    geometry={nodes.Cylinder_1.geometry}
                    material={materials.turret}
                />
            </group>

            {Config.DEBUG && (
                <mesh>
                    <boxGeometry args={[...size, 1, 1, 1]} />
                    <meshBasicMaterial wireframe color="orange" name="debug" />
                </mesh> 
            )}
        </group>
    )
}

export default memo(Turret)