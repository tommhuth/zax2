import { HeatSeaker, WorldPartBoss } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { createHeatSeaker, damageBoss, registerBoss, removeBoss, removeHeatSeaker } from "../../../data/store/boss"
import { Frustum, Group, Matrix4, Vector3 } from "three"
import { store, useStore } from "../../../data/store"
import { Tuple3 } from "../../../types"
import { useFrame } from "@react-three/fiber"
import { createExplosion, createParticles } from "../../../data/store/effects"
import { setLastImpactLocation } from "../../../data/store/player"
import { useBulletCollision } from "../../../data/hooks"
import { Text3D } from "@react-three/drei"
import { setMatrixAt, setMatrixNullAt } from "../../../data/utils"

let bossSize: Tuple3 = [4, 3, 2]

let _dir = new Vector3()
let _mat4 = new Matrix4()
let _frustum = new Frustum()

function HeatSeaker({ position, index, size, client, id, speed }: HeatSeaker) {
    let grid = useStore(i => i.world.grid)

    useFrame((state, delta) => {
        let { player, world, instances } = store.getState()

        let aspeed = 10
        let turnEffect = .35

        if (!player.object) {
            return
        }

        _frustum.setFromProjectionMatrix(_mat4.multiplyMatrices(
            state.camera.projectionMatrix,
            state.camera.matrixWorldInverse
        ))

        if (!_frustum.containsPoint(position) || position.x > 10 || position.x < -10 || position.y > 100) {
            removeHeatSeaker(id)
        }

        _dir.copy(position)
            .sub(player.object.position)
            .normalize()
            .multiplyScalar(-turnEffect)

        speed.x += _dir.x * delta * 4
        speed.y += _dir.y * delta * 4
        speed.z += _dir.z * delta * 4

        speed.normalize()

        position.x += aspeed * speed.x * delta
        position.y += aspeed * speed.y * delta
        position.z += aspeed * speed.z * delta
        position.y = Math.max(.45, position.y)

        setMatrixAt({
            instance: instances.sphere.mesh,
            index,
            position: position.toArray(),
            scale: size
        })

        client.position = position.toArray()
        world.grid.updateClient(client)
    })

    useLayoutEffect(() => {
        return () => {
            let { instances } = store.getState()

            setMatrixNullAt(instances.sphere.mesh, index)
            // must happen here at the very end and after any useFrame updates??
            grid.remove(client)
            createExplosion({
                position: position.toArray(),
                shockwave: false,
                radius: random.float(.45, .55)
            })
        }
    }, [index, grid])

    return null
}

export default function BossPart({
    id,
    position,
    counter,
    size,
}: WorldPartBoss) {
    let grid = useStore(i => i.world.grid)
    let boss = useStore(i => i.boss)
    let dead = useRef(false)
    let textZ = 50
    let z = position.z + 25
    let bossWrapper = useRef<Group>(null)
    let bossPosition = useMemo(() => new Vector3(), [])
    let client = useMemo(() => {
        return grid.newClient([0, 0, z], bossSize, {
            type: "boss",
            id: "boss",
            size: bossSize,
            position: bossPosition,
        })
    }, [grid])

    useEffect(() => {
        let tid = setInterval(() => {
            createHeatSeaker(bossPosition.toArray())
        }, 950)

        return () => {
            clearInterval(tid)
        }
    }, [])

    useBulletCollision({
        name: "bulletcollision:boss",
        handler: ({ detail: { bullet } }) => {
            if (dead.current) {
                return
            }

            let position: Tuple3 = [bullet.position.x, bullet.position.y, bossPosition.z - bossSize[2] / 2]

            damageBoss(10)
            setLastImpactLocation(...position)
            createParticles({
                position: position,
                positionOffset: [[0, 0], [0, 0], [0, 0]],
                speed: [3, 29],
                speedOffset: [[0, 0], [0, 0], [0, 0]],
                normal: [0, 0, -1],
                count: [0, 3],
                radius: [.1, .3],
                friction: [.8, .95],
                color: "#00f",
            })
        }
    })

    useEffect(() => {
        if (boss?.health === 0 && !dead.current) {
            dead.current = true

            for (let i = 0; i < 3; i++) {
                let position = bossPosition.toArray()

                setTimeout(() => {
                    createExplosion({
                        position: [
                            position[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            position[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                            position[2]
                        ],
                        radius: random.float(.5, .75),
                        count: 16,
                        shockwave: true,
                    })
                    createParticles({
                        position: [
                            position[0] + random.float(-bossSize[0] / 2, bossSize[0] / 2),
                            position[1] + random.float(-bossSize[1] / 2, bossSize[1] / 2),
                            position[2]
                        ],
                        positionOffset: [[0, 0], [0, 0], [0, 0]],
                        speed: [5, 30],
                        speedOffset: [[0, 0], [0, 0], [0, 0]],
                        normal: [random.float(-1, 1), 1, random.float(-1, 1)],
                        count: [14, 16],
                        radius: [.2, .6],
                        friction: [.8, .95],
                        color: "#00f",
                    })
                }, i * 350)
            }

            setTimeout(() => {
                createExplosion({
                    position: bossPosition.toArray(),
                    radius: random.float(1.3, 1.5),
                    count: 26,
                    shockwave: true,
                })
            }, 950)

            setTimeout(() => {
                removeBoss()
            }, 1200)
        }

    }, [boss?.health])

    useFrame((state) => {
        if (dead.current || !bossWrapper.current) {
            return
        }

        bossWrapper.current.position.x = Math.cos(state.clock.elapsedTime * .45) * 3.5
        bossWrapper.current.position.y = bossSize[1] / 2 + 1 + Math.sin(state.clock.elapsedTime * .97) * .85
        bossWrapper.current.position.z = z + Math.sin(state.clock.elapsedTime * .6) * 2

        bossPosition.copy(bossWrapper.current.position)
        client.position = bossPosition.toArray()
        grid.updateClient(client)
    })

    useEffect(() => {
        registerBoss({
            pauseAt: position.z + 15,
            size: bossSize,
            position: bossPosition.copy(bossWrapper.current.position)
        })
    }, [])

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            {boss?.heatSeakers.map(i => {
                return <HeatSeaker key={i.id} {...i} />
            })}

            <group
                ref={bossWrapper}
                position-z={z}
            >
                <mesh
                    castShadow
                    visible={!!boss}
                    receiveShadow
                >
                    <boxGeometry args={bossSize} />
                    <meshLambertMaterial color="blue" />
                </mesh>

            </group>

            <Text3D
                font="/fonts/roboto.json"
                scale={[3, 3, 8]}
                position-z={position.z + textZ}
                position-y={-1}
                position-x={12}
                rotation-y={Math.PI}
                rotation-x={Math.PI * .5}
                lineHeight={.55}
                receiveShadow
                letterSpacing={-.15}
            >
                LVL
                <meshLambertMaterial color="blue" />
            </Text3D>

            <Text3D
                font="/fonts/roboto.json"
                scale={[5.5, 5.5, 8]}
                rotation-x={Math.PI * .5}
                position-z={position.z + textZ}
                position-x={6}
                position-y={-1}
                rotation-y={Math.PI}
                lineHeight={.55}
                receiveShadow
                letterSpacing={-.05}
            >
                0{counter + 1}
                <meshLambertMaterial color="blue" />
            </Text3D>

            <Floor
                type={"floor1"}
                scale={[1, 1, 4]}
                position={[position.x, 0, size[1] / 2]}
            />
        </WorldPartWrapper>
    )
}

// 

/*

            {"LEVEL".split("").map((i, index) => {
                return ( 
                    <Text3D
                        font="/fonts/roboto.json"
                        scale={[5, 5, 8]}
                        position-z={position.z + textZ + 2 + index * 1.85}
                        position-x={-index * 2}
                        position-y={0}
                        key={index}
                        rotation-y={Math.PI}
                        lineHeight={.55}
                        receiveShadow
                        letterSpacing={-.05}
                    >
                        {i}
                        <MeshLambertFogMaterial color="blue" />
                    </Text3D>
                )
            })}
            */