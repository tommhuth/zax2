import { startTransition } from "react"
import { useStore } from "../../data/store" 
import { setState } from "../../data/store/utils"
import { useWindowEvent } from "../../data/hooks"
import { BossState } from "../../data/types" 
import Map from "./Map"

import "./Ui.scss" 

export default function Ui() {
    let state = useStore(i => i.state)
    let ready = useStore(i => i.ready)
    let player = useStore(i => i.player) 
    let boss = useStore(i => i.boss)
    let level = useStore(i => i.world.level) 

    useWindowEvent(["click", "touchstart"], () => {
        if (state === "intro" && ready) {
            startTransition(()=> setState("running"))
        }
    }, [ready, state]) 

    return (
        <> 
            <Map />
            <div
                className={"levelc"}
                style={{
                    display: boss?.state === BossState.OUTRO ? "block": "none"
                }}
            >
                <h1>Level#{level}</h1> 
            </div> 

            <div
                className="ui"
                style={{
                    opacity: !ready || boss?.state === BossState.OUTRO ? 0 : 1,
                    marginBottom: ready ? 0 : "-1em",
                }}
            >
                {player.health.toFixed(0)}%

                <div>{player.score.toLocaleString("en")}</div>
            </div>
            <div
                className="boss"
                style={{
                    display: [BossState.ACTIVE].includes(boss.state) ? undefined : "none",
                }}
            >
                <div
                    className="boss__bar"
                    style={{
                        width: boss ? (boss.health / boss.maxHealth) * 100 + "%" : 0,
                    }}
                />
            </div>
        </>
    )
}
 