import { useFrame } from "@react-three/fiber"
import { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Group, Vector3 } from "three"
import { Tuple3 } from "../types.global"
import { clamp, ndelta } from "../data/utils"
import { BossState, Owner } from "../data/types"
import animate from "@huth/animate"
import { store, useStore } from "../data/store"
import { useShallow } from "zustand/react/shallow"
import { damagePlayer, setPlayerObject } from "../data/store/player"
import { removeHeatSeaker, setBossProp } from "../data/store/boss"
import { useCollisionDetection } from "../data/collisions"
import { easeInOutCubic, easeInQuad } from "../data/shaping"
import { damp } from "three/src/math/MathUtils.js"
import { BULLET_SIZE, EDGE_MAX, EDGE_MIN, WORLD_PLAYER_START_Z } from "../data/const"
import DebugBox from "./DebugBox"
import { createExplosion, createParticles, setTimeScale } from "@data/store/effects"
import random from "@huth/random"
import { createBullet } from "@data/store/actors/bullet.actions"
import { damagePlane } from "@data/store/actors/plane.actions"
import { damageRocket } from "@data/store/actors/rocket.actions"
import { damageTurret } from "@data/store/actors/turret.actions"
import { damageBarrel } from "@data/store/actors/barrel.actions"
import PlayerModel from "./world/models/PlayerModel"
import { setState } from "@data/store/utils"

const depth = 2
const size: Tuple3 = [1.5, 1, depth]
const [x, y, z]: Tuple3 = [0, 1.5, 0]

function explode(position: Vector3) {
    for (let i = 0; i < 9; i++) {
        createExplosion({
            position: position.toArray(),
            count: random.integer(6, 8),
            delay: i * 400,
            shockwave: i === 7,
            blastRadius: i % 3 === 0 ? random.float(3, 5) : 0
        })
        createParticles({
            position: position.toArray(),
            offset: [
                [-size[0] / 2, size[0] / 2],
                [-size[1] / 2, size[1] / 2],
                [-size[2] / 2, size[2] / 2]
            ],
            count: random.integer(8, 16),
            radius: [.05, .3],
            stagger: [0, 100],
            restitution: [.4, .85],
            normal: [random.float(-1, 1), 1, -1],
            delay: i * 650,
            color: ["#88F", "#00f", "#007", "#249", "#09F"]
        })
    }
}

interface LocalData {
    nextShotAt: number
    bossDeadAt: number
}

export default function Player() {
    let grid = useStore(i => i.world.grid)
    let bossState = useStore(i => i.boss.state)
    let [
        setup,
        controls
    ] = useStore(useShallow(i => [i.setup, i.controls]))
    let [
        targetPosition,
        position,
        health,
        attempts,
        playerObject
    ] = useStore(
        useShallow(({ player }) => [
            player.targetPosition,
            player.position,
            player.health,
            player.attempts,
            player.object
        ])
    )
    let [dead, setDead] = useState(false)
    let client = useMemo(() => {
        return grid.createClient([0, 0, z], size, {
            type: "player",
            id: "player",
        })
    }, [grid])
    let data = useMemo<LocalData>(() => {
        return {
            nextShotAt: 0,
            bossDeadAt: 0,
        }
    }, [])
    let handleRef = useCallback((object: Group) => {
        if (!object) {
            return
        }

        setPlayerObject(object)
    }, [])

    useEffect(() => {
        if (health === 0) {
            explode(position)
            setState("gameover")
            setDead(true)
            animate({
                from: 1,
                to: .3,
                duration: 1500,
                easing: easeInOutCubic,
                render(timeScale) {
                    setTimeScale(timeScale)
                }
            })
        }
    }, [health, position])

    useEffect(() => {
        if (bossState === BossState.DEAD) {
            data.bossDeadAt = Date.now()
        }
    }, [bossState, data])

    useCollisionDetection({
        client,
        active: () => !dead,
        bullet: ({ bullet }) => {
            if (bullet.owner === Owner.ENEMY) {
                damagePlayer(5)
            }
        },
        obstacle: () => {
            damagePlayer(100)
        },
        turret: (data) => {
            damageTurret(data.id, 100)
            damagePlayer(100)
        },
        barrel: (data) => {
            damageBarrel(data.id, 100)
            damagePlayer(20)
        },
        plane: (data) => {
            damagePlane(data.id, 100)
            damagePlayer(50)
        },
        rocket: (data) => {
            damageRocket(data.id, 100)
            damagePlayer(50)
        },
        heatSeaker: (data) => {
            removeHeatSeaker(data.id)
            damagePlayer(25)
        },
    })

    // init player position
    useLayoutEffect(() => {
        if (playerObject) {
            playerObject.position.set(x, y, z)
            targetPosition.copy(playerObject.position)
        }
    }, [playerObject, targetPosition])

    // init player ready position
    useLayoutEffect(() => {
        if (setup && playerObject) {
            playerObject.position.z = WORLD_PLAYER_START_Z
        }
    }, [setup, attempts, playerObject])

    // input
    useFrame((state, delta) => {
        let xSpeed = 12
        let ySpeed = 10
        let nd = ndelta(delta)

        if (Object.entries(controls.keys).length) {
            if (controls.keys.a) {
                targetPosition.x += xSpeed * nd
            } else if (controls.keys.d) {
                targetPosition.x -= xSpeed * nd
            }

            if (controls.keys.w) {
                targetPosition.y += ySpeed * nd
            } else if (controls.keys.s) {
                targetPosition.y -= ySpeed * nd
            }

            targetPosition.clamp(EDGE_MIN, EDGE_MAX)
        }
    })

    // shoot
    useFrame(() => {
        let {
            effects: { timeScale },
            player: { weapon },
            state
        } = store.getState()

        if (Date.now() > data.nextShotAt && controls.keys.space && setup && state === "running") {
            startTransition(() => {
                createBullet({
                    position: [
                        position.x,
                        position.y,
                        position.z + (depth / 2 + BULLET_SIZE / 2) * 1.5
                    ],
                    owner: Owner.PLAYER,
                    rotation: Math.PI * -.5,
                    speed: weapon.speed,
                    color: "#fff",
                })
                data.nextShotAt = Date.now() + weapon.fireFrequency * (1 / timeScale)
            })
        }
    })

    // movement
    useFrame((_, delta) => {
        let { ready, boss, player, state } = useStore.getState()

        if (playerObject && ready && state === "running") {
            let nd = ndelta(delta)
            let object = playerObject
            let y = clamp(targetPosition.y, EDGE_MIN.y, EDGE_MAX.y)
            let move = (speed: number) => {
                if (dead) {
                    return
                }

                object.position.x = damp(object.position.x, targetPosition.x, 4, nd)
                object.position.y = damp(object.position.y, y, 5, nd)
                object.position.z += speed * nd

                object.rotation.z = (targetPosition.x - object.position.x) * -.25
                object.rotation.x = (targetPosition.y - object.position.y) * -.2

                player.velocity.z = clamp((speed * nd) / (speed * nd), 0, 1)
            }

            if (boss.state === BossState.IDLE) {
                let t = 1 - clamp((object.position.z - boss.pauseAt - 3) / 3, 0, 1)

                move(player.speed * t)

                if (t < .5) {
                    startTransition(() => setBossProp("state", BossState.ACTIVE))
                }
            } else if (boss.state === BossState.ACTIVE) {
                move(0)
            } else if (boss.state === BossState.DEAD) {
                let t = easeInQuad(clamp((Date.now() - data.bossDeadAt) / 2400, 0, 1))

                move(player.speed * t)
            } else {
                move(player.speed)
            }

            position.copy(object.position)
            client.position = position.toArray()
            grid.updateClient(client)
        }
    })

    return (
        <group ref={handleRef}>
            <PlayerModel dead={dead} />
            <DebugBox size={size} />
        </group>
    )
}