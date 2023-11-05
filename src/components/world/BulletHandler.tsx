import { useFrame } from "@react-three/fiber"
import { memo, startTransition } from "react"
import { InstancedMesh, Matrix4, Object3D, Quaternion, Raycaster, Vector3 } from "three" 
import { Bullet, Owner } from "../../data/types"
import { Tuple3 } from "../../types"
import { getCollisions } from "../../data/hooks"
import { ndelta, setColorAt, setMatrixAt, setMatrixNullAt } from "../../data/utils"
import { store } from "../../data/store"
import { damagePlayer, increaseScore, setLastImpactLocation } from "../../data/store/player"
import { createParticles } from "../../data/store/effects"
import { damagePlane, damageRocket, damageTurret, removeBullet } from "../../data/store/actors"
import { damageBarrel } from "../../data/store/world"

let _origin = new Vector3()
let _direction = new Vector3()
let _speed = new Vector3()
let _raycaster = new Raycaster(_origin, _direction, 0, 4)

function intersect(object: Object3D, position: Vector3, movement: Tuple3) {
    _raycaster.set(
        _origin.copy(position).sub(
            _speed.set(movement[0], .1, movement[2])
                .normalize()
                .multiplyScalar(2.5)
        ),
        _direction.set(...movement).normalize()
    )

    let [intersection] = _raycaster.intersectObject(object, false) || []

    if (object instanceof InstancedMesh && intersection?.instanceId && intersection.face) {
        const quaternion = new Quaternion()
        const instanceMatrix = new Matrix4()

        object.getMatrixAt(intersection.instanceId, instanceMatrix)
        instanceMatrix.decompose(new Vector3(), quaternion, new Vector3())

        intersection.face.normal.applyMatrix4(
            new Matrix4().makeRotationFromQuaternion(quaternion)
        )
    }

    return intersection
}

function BulletHandler() {
    useFrame((state, delta) => {
        let { instances, world: { bullets, grid, frustum }, player } = store.getState()
        let removed: Bullet[] = []

        if (!instances.line || !player.object || !instances.device) {
            return
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
            let bulletDiagonal = Math.sqrt((bullet.size[2] * .5) ** 2 + bullet.size[2] ** 2)
            let collisions = getCollisions({
                grid,
                position: bullet.position,
                size: bullet.size,
                source: {
                    position: bullet.position,
                    rotation: bullet.rotation,
                    size: [bulletDiagonal, bullet.size[1], bulletDiagonal],
                    obb: bullet.obb,
                }
            })
            let movement: Tuple3 = [
                Math.cos(bullet.rotation) * bullet.speed,
                0,
                Math.sin(bullet.rotation) * bullet.speed
            ]

            for (let i = 0; i < collisions.length; i++) {
                let client = collisions[i]

                if (client.data.type === "building") {
                    let intersection = intersect(instances.device.mesh, bullet.position, movement)

                    if (intersection?.face) {
                        setLastImpactLocation(...intersection.point.toArray())
                        createParticles({
                            position: intersection.point.toArray(),
                            positionOffset: [[0, 0], [0, 0], [0, 0]],
                            speed: [7, 14],
                            speedOffset: [[-2, 2], [-2, 2], [-2, 2]],
                            normal: intersection.face.normal.toArray(),
                            count: [1, 2],
                            radius: [.1, .2],
                            friction: [.8, .95],
                            color: "#fff",
                        })
                    }
                } else if (client.data.type === "plane") {
                    if (bullet.owner === Owner.PLAYER) {
                        let intersection = intersect(instances.box.mesh, bullet.position, movement)

                        if (intersection) {
                            createParticles({
                                position: intersection.point.toArray(),
                                count: [1, 3],
                                speed: [8, 12],
                                positionOffset: [[0, 0], [0, 0], [0, 0]],
                                speedOffset: [[-5, 5], [0, 0], [5, 18]],
                                normal: [0, -1, 0],
                                color: "yellow",
                            })
                        }

                        damagePlane(client.data.id, bullet.damage)
                    }
                } else if (client.data.type === "rocket") {
                    if (bullet.owner === Owner.PLAYER) {
                        let intersection = intersect(instances.cylinder.mesh, bullet.position, movement)

                        if (intersection) {
                            createParticles({
                                position: intersection.point.toArray(),
                                count: [2, 4],
                                speed: [8, 12],
                                positionOffset: [[0, 0], [0, 0], [0, 0]],
                                speedOffset: [[-5, 5], [0, 0], [-5, 5]],
                                normal: intersection.face?.normal.toArray() as Tuple3,
                                color: "purple",
                            })
                        }

                        damageRocket(client.data.id, bullet.damage)
                    }
                } else if (client.data.type === "turret") {
                    if (bullet.owner === Owner.PLAYER) {
                        let intersection = intersect(instances.turret.mesh, bullet.position, movement)

                        if (intersection?.face) {
                            setLastImpactLocation(...intersection.point.toArray())
                            createParticles({
                                position: intersection.point.toArray(),
                                positionOffset: [[0, 0], [0, 0], [0, 0]],
                                count: [1, 2],
                                speed: [11, 22],
                                speedOffset: [[-5, 5], [0, 0], [-5, 5]],
                                normal: intersection.face.normal.toArray(),
                                normalOffset: [[0, 0], [0, 0], [0, 0]],
                                color: "white"
                            })
                        }

                        damageTurret(client.data.id, bullet.damage)
                    }
                } else if (client.data.type === "player") {
                    damagePlayer(bullet.damage)
                    increaseScore(-10)
                } else if (client.data.type === "barrel") {
                    if (bullet.owner === Owner.PLAYER) {
                        damageBarrel(client.data.id, 100)
                        increaseScore(1000)
                    }
                }
            }

            bullet.position.x += movement[0] * ndelta(delta)
            bullet.position.z += movement[2] * ndelta(delta)

            setMatrixAt({
                instance: instances.line.mesh,
                index: bullet.index,
                position: [
                    bullet.position.x,
                    bullet.position.y - .2,
                    bullet.position.z,
                ],
                rotation: [0, bullet.rotation + Math.PI * .5, 0],
                scale: bullet.size,
            })

            if (!frustum.containsPoint(bullet.position) || collisions.length) {
                removed.push(bullet)
            }

            if (!bullet.mounted) {
                setColorAt(instances.line.mesh, bullet.index, bullet.color)
                bullet.mounted = true
            }
        }

        for (let i = 0; i < removed.length; i++) {
            let bullet = removed[i]

            setMatrixNullAt(instances.line.mesh, bullet.index)
        }

        if (removed.length) {
            startTransition(() => removeBullet(...removed.map(i => i.id)))
        }
    })

    return null
}

export default memo(BulletHandler)