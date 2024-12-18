import { startTransition, useEffect } from "react"
import { useStore } from "../../../data/store"
import { BossState, WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Boss from "../actors/Boss" 
import { registerBoss, resetBoss, setBossProp } from "../../../data/store/boss"
import Barrel from "../spawner/Barrel"
import Cable from "../decoration/Cable"
import Dirt from "../decoration/Dirt"
import timeout from "../../../data/timeout"
import { uiTunnel } from "../../ui/tunnels" 
import Floor from "../decoration/Floor"

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
            
            <Floor type="floor5" position={[9.5, 0, position.z]} />

            <Barrel
                position={[6, 0, 15]}
            />
            <Barrel
                position={[5, 0, 32]}
            />
            <Barrel
                position={[5.5, 0, 29]}
            />
            <Cable
                position={[0, 0, 10]}
                scale={1.25}
            />
            <Cable
                position={[-5, 0, 30]}
                scale={1}
                rotation={1.5}
            />
            <Dirt
                position={[3, 0, 32]}
                scale={2}
                rotation={1}
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