import { useStore } from "../../data/store"
import Map from "./map/Map"
import { useEffect, useRef } from "react"

import "./Ui.scss"
import { BossState } from "@data/types"
import Debug from "./debug/Debug"

function GameOver() {
    return (
        <div className="game-over">Game over</div>
    )
}

function BossUi() {
    let boss = useStore(i => i.boss)
    let level = useStore(i => i.player.level)

    return (
        <>
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
                <p>Level#{level}</p>
            </div>
        </>
    )
}

function PlayerUi() {
    let scoreRef = useRef<HTMLDivElement>(null)
    let health = useStore(i => i.player.health)

    useEffect(() => {
        return useStore.subscribe((state) => {
            if (!scoreRef.current) {
                return
            }

            scoreRef.current.innerText = state.player.score.toLocaleString("en")
        })
    }, [])

    return (
        <div
            className="player-ui"
            key="player"
        >
            <div>{health.toFixed(0)}%</div>
            <div ref={scoreRef} />
        </div>
    )
}

export default function Ui() {
    let qs = new URLSearchParams(location.search)
    let ready = useStore(i => i.ready)
    let state = useStore(i => i.state)
    let boss = useStore(i => i.boss)
    let attempts = useStore(i => i.player.attempts)

    return (
        <>
            <Map key={attempts} />

            {ready && state === "intro" && <Intro />}
            {state === "gameover" && <GameOver />}
            {state === "running" && <PlayerUi />}
            {state !== "gameover" && boss.state !== "unknown" && <BossUi />}

            {qs.has("debug") ? <Debug /> : null}
            {!qs.has("editor") ? <div id="shoot" /> : null}
        </>
    )
}

function Intro() {
    return (
        <h1 className="intro">
            Untitled <br />
            retro shooter
        </h1>
    )
}