import { memo, startTransition, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { clamp, ndelta } from "../../../data/utils"
import random from "@huth/random"
import { Mesh, Vector3 } from "three"
import { Owner, Turret as TurretType } from "../../../data/types"
import { GLTFModel, Tuple3 } from "../../../types.global"
import { store, useStore } from "../../../data/store"
import { createExplosion, createImpactDecal, createParticles, createScrap, increaseTrauma } from "../../../data/store/effects"
import { turretColor, turretParticleColor } from "../../../data/theme"
import { useCollisionDetection } from "../../../data/collisions"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../../../data/const"
import { useBaseActorHandler } from "../../../data/hooks"
import { useGLTF } from "@react-three/drei"
import { damp } from "three/src/math/MathUtils.js"
import model from "@assets/models/turret2.glb"
import DebugBox from "@components/DebugBox"
import { createBullet } from "@data/store/actors/bullet.actions"
import { removeTurret, damageTurret } from "@data/store/actors/turret.actions"
import { increaseScore } from "@data/store/player"

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

function Turret({
    id,
    client,
    size,
    position,
    health,
    fireFrequency,
    rotation,
    floorAt: floorLevel
}: TurretType) {
    let { nodes } = useGLTF(model) as GLTFModel<["turret2_1", "turret2_2"]>
    let diagonal = useStore(i => i.world.diagonal)
    let materials = useStore(i => i.materials)
    let shootTimer = useRef(0)
    let barrellRef = useRef<Mesh>(null)
    let nextShotAt = useRef(fireFrequency)

    useBaseActorHandler({
        client,
        health,
        position,
        removeDelay: 350,
        remove: () => removeTurret(id),
        destroy: () => {
            explode(position, size)
            createImpactDecal([position.x, .1, position.z])
            createScrap([position.x, floorLevel, position.z], 2, turretColor)
        }
    })

    useCollisionDetection({
        client,
        bullet: ({ bullet, normal, intersection }) => {
            if (bullet.owner !== Owner.PLAYER) {
                return
            }

            if (damageTurret(id, 25)) {
                increaseScore(2_000)
                increaseTrauma(.5)
            } else {
                increaseScore(50)
                increaseTrauma(.05)
            }

            createParticles({
                position: intersection,
                offset: [[-.25, .25], [0, .25], [-.25, .25]],
                speed: [1, 10],
                spread: [[-.1, .1], [-.1, .1]],
                normal,
                count: [5, 8],
                radius: [.05, .2],
                stagger: [0, 0],
                color: turretParticleColor,
            })
        }
    })

    // shooting
    useFrame((state, delta) => {
        let { effects, player: { object: playerObject }, world } = store.getState()
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
                    speed: bulletSpeed,
                    rotation: rotation,
                    owner: Owner.ENEMY
                })
            })

            shootTimer.current = 0
            nextShotAt.current = (
                fireFrequency * random.float(.75, 1)
                - fireFrequency * distanceFromPlayer * .5
                + heightPenalty * fireFrequency * 2
            ) * (1 / effects.timeScale)

            if (barrellRef.current) {
                barrellRef.current.position.z = -.5
            }
        }

        shootTimer.current += ndelta(delta) * 1000
    })

    // barrell anim
    useFrame((state, delta) => {
        if (!barrellRef.current) {
            return
        }

        barrellRef.current.position.z = damp(barrellRef.current.position.z, 0, 1.5, ndelta(delta))
    })

    return (
        <>
            <group
                dispose={null}
                position={position.toArray()}
                rotation={[0, -rotation + Math.PI * .5, 0]}
            >
                <group>
                    <mesh
                        castShadow
                        receiveShadow
                        material={materials.turret}
                    >
                        <primitive
                            object={nodes.turret2_1.geometry}
                            attach="geometry"
                        />
                    </mesh>
                    {/* barrell */}
                    <mesh
                        castShadow
                        receiveShadow
                        ref={barrellRef}
                        geometry={nodes.turret2_2.geometry}
                        material={materials.turret}
                    />
                </group>
            </group>

            <DebugBox size={size} position={position} />
        </>
    )
}

export default memo(Turret)