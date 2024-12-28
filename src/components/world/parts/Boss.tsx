import { startTransition, useEffect } from "react"
import { useStore } from "../../../data/store"
import { BossState, WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Boss from "../actors/Boss"
import { registerBoss, resetBoss, setBossProp } from "../../../data/store/boss"
import BarrelSpawner from "../spawner/Barrel"
import Cable from "../decoration/Cable"
import Dirt from "../decoration/Dirt"
import timeout from "../../../data/timeout"
import { uiTunnel } from "../../ui/tunnels"
import Floor from "../decoration/Floor"
import EdgeElement from "../decoration/EdgeElement"
import Grass from "../decoration/Grass"
import Plant from "../actors/Plant"
import Obstacle from "../decoration/Obstacle"

export default function BossPart({
    id,
    position,
    size,
}: WorldPart) {
    let bossZ = position.z + 23
    let pauseAt = position.z + 5
    let boss = useStore(i => i.boss)
    let level = useStore(i => i.player.level)

    useEffect(() => {
        if (boss.state === BossState.DEAD) {
            timeout(() => {
                setBossProp("state", BossState.OUTRO)
                timeout(() => setBossProp("state", BossState.UNKNOWN), 6_000)
            }, 2000)
        }
    }, [boss.state])

    useEffect(() => {
        startTransition(() => {
            registerBoss(pauseAt)
        })

        return () => resetBoss()
    }, [pauseAt])

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Boss startPosition={[0, 0, bossZ]} />

            <Floor
                position={[position.x, 0, size[1] / 2]} 
                type="floor5"
            />

            <Dirt
                position={[0, 0, 6]}
                rotation={3.142}
                scale={2.2}
            />

            <Obstacle
                position={[-5.5, 0.5, 6.5]}
                rotation={0}
                size={[3.5, 2, 5]}
                type={"box"}
            />


            <Grass
                position={[4.5, 0, 9]}
                rotation={0.332}

            />

            <EdgeElement
                position={[8.5, 0, 10.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall3"}
            />

            <Obstacle
                position={[0.5, -0.5, 11]}
                rotation={0}
                size={[2.5, 2, 2.5]}
                type={"device"}
            />

            <Obstacle
                position={[-2.5, 0.5, 11]}
                rotation={0}
                size={[2.5, 2, 2.5]}
                type={"box"}
            />

            <Obstacle
                position={[-5.5, 0.5, 11]}
                rotation={0}
                size={[3.5, 2, 2.5]}
                type={"box"}
            />

            <BarrelSpawner
                position={[5.5, 0, 17.5]}


            />

            <EdgeElement
                position={[9.5, 0, 18.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall2"}
            />

            <EdgeElement
                position={[6, 0, 23]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"tower1"}
            />

            <EdgeElement
                position={[6, 0, 26.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"tower1"}
            />

            <Cable
                position={[3, 0, 32]}
                rotation={0.855}
                scale={0.9}
            />

            <EdgeElement
                position={[8.5, 0, 37]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall2"}
            />

            <Dirt
                position={[0, 0, 37]}
                rotation={0}
                scale={2.4}
            />

            <EdgeElement
                position={[5, 0, 39.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"tower1"}
            />

            <EdgeElement
                position={[5, 0, 42.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"tower1"}
            />

            <Grass
                position={[3, 0, 43]}
                rotation={0} 
            />

            <Grass
                position={[-4, 0, 45]}
                rotation={0.393}

            />

            <Plant
                position={[8.5, 0, 49]}
                rotation={0}
                scale={1}
            />

            <uiTunnel.In>
                <div
                    className="boss-health"
                    style={{
                        display: boss.state === BossState.ACTIVE ? "block" : "none"
                    }}
                    key="bosshealth"
                >
                    <div
                        className="boss-health__bar"
                        style={{
                            width: boss ? (boss.health / boss.maxHealth) * 100 + "%" : 0,
                        }}
                    />
                </div>

                <div
                    className={"level"}
                    key="level"
                    style={{
                        display: boss?.state === BossState.OUTRO ? "block" : "none"
                    }}
                >
                    <h1>Level#{level}</h1>
                </div>
            </uiTunnel.In>
        </WorldPartWrapper>
    )
}