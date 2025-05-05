import { useStore } from "../../data/store"
import Map from "./map/Map"
import { useEffect, useRef } from "react"
import { BossState } from "@data/types"
import Debug from "./debug/Debug"

import "./Ui.scss"

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
                style={{
                    display: boss?.state === BossState.OUTRO ? "block" : "none"
                }}
            >
                <p>Level {level}</p>
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
        <>
            <Map />

            <div className="player-ui">
                <div>{health.toFixed(0)}%</div>
                <div ref={scoreRef} />
            </div>
        </>
    )
}

export default function ZaxxUi() {
    let qs = new URLSearchParams(location.search)
    let ready = useStore(i => i.ready)
    let state = useStore(i => i.state)
    let boss = useStore(i => i.boss)

    return (
        <>
            {ready && state === "intro" && <Intro />}
            {state === "gameover" && <GameOver />}
            {state === "running" && <PlayerUi />}
            {state !== "gameover" && boss.state !== "unknown" && <BossUi />}

            {qs.has("debug") ? <Debug /> : null}
        </>
    )
}

function Intro() {
    return (
        <div className="intro">
            Untitled <br />
            retro shooter
        </div>
    )
}