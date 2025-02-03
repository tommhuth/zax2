import { useStore } from "../../data/store"
import Map from "./map/Map"
import Debug from "./Debug"
import { uiTunnel } from "./tunnels"
import { useEffect, useRef } from "react"

import "./Ui.scss"

function GameOver() {
    return (
        <div className="game-over">Game over</div>
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

    return (
        <>
            <Map />
            <uiTunnel.Out />

            {ready && state === "intro" && <Intro />}
            {state === "gameover" && <GameOver />}
            {state === "running" && <PlayerUi />}

            {qs.has("debug") ? <Debug /> : null}
            {!qs.has("editor") ? <div id="shoot" /> : null}
        </>
    )
}

function Intro() {
    return (
        <div className="intro">
            Tap to start
        </div>
    )
}