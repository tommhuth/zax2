import { useRef } from "react"
import { useStore } from "../../data/store"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../world/World"

import "./Ui.scss"
import { setState } from "../../data/store/utils"
import { useAnimationFrame, useWindowEvent } from "../../data/hooks"

export default function Ui() {
    let state = useStore(i => i.state)
    let player = useStore(i => i.player)
    let loaded = useStore(i => i.loaded)
    let boss = useStore(i => i.boss)
    let currentHeightRef = useRef<HTMLDivElement>(null)
    let bars = 5

    useWindowEvent(["click", "touchstart"], () => {
        if (state === "intro") {
            setState("running")
        }
    }, [state])

    useAnimationFrame(() => {
        let player = useStore.getState().player.object

        if (player && currentHeightRef.current) {
            let height = (player.position.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE)

            currentHeightRef.current.style.height = (height * 100 + 1).toFixed(1) + "%"
        }
    })

    return (
        <>
            <div
                className="intro"
                style={{
                    display: state === "intro" && loaded ? undefined : "none"
                }}
            >
                <h1 className="title">Untitled arcade knockoff</h1> 
            </div>

            <div
                className="height"
                style={{
                    opacity: state === "intro" ? 0 : 1
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
            <div
                className="ui"
                style={{
                    opacity: state === "intro" ? 0 : 1
                }}
            >
                {player.health.toFixed(0)}%

                <div>{player.score.toLocaleString("en")}</div>
            </div>
            <div
                className="boss"
                style={{
                    display: boss ? undefined : "none",
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