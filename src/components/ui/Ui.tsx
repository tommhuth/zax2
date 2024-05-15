import { startTransition, useRef } from "react"
import { useStore } from "../../data/store" 
import { setState } from "../../data/store/utils"
import { useAnimationFrame, useWindowEvent } from "../../data/hooks"
import { BossState } from "../../data/types" 

import "./Ui.scss" 
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../../data/const"
import Map from "./Map"

export default function Ui() {
    let state = useStore(i => i.state)
    let ready = useStore(i => i.ready)
    let player = useStore(i => i.player) 
    let boss = useStore(i => i.boss)
    let level = useStore(i => i.world.level)
    let currentHeightRef = useRef<HTMLDivElement>(null)
    let bars = 5

    useWindowEvent(["click", "touchstart"], () => {
        if (state === "intro" && ready) {
            startTransition(()=> setState("running"))
        }
    }, [ready, state])

    useAnimationFrame(() => {
        let player = useStore.getState().player.object

        if (player && currentHeightRef.current) {
            let height = (player.position.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE)

            currentHeightRef.current.style.height = (height * 100 + 1).toFixed(1) + "%"
        }
    }) 

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

/*

            <div
                className="height"
                style={{
                    opacity: !ready || boss?.state === BossState.OUTRO ? 0 : 1,
                    marginLeft: ready ? 0 : "-1em",
                }}
            >
                <div className="height__top">H</div>
                <div
                    className="height__current"
                    ref={currentHeightRef}
                />
                {new Array(bars).fill(null).map((i, index) => {

                    return (
                        <div
                            className="height__bar"
                            key={index}
                            style={{
                                bottom: (index) / (bars - 1) * 100 + "%"
                            }}
                        />
                    )
                })}
                <div className="height__bottom">L</div>
            </div>
            */