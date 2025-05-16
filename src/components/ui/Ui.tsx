import { store, useStore } from "../../data/store"
import { useEffect, useRef } from "react"
import { BossState } from "@data/types"
import Debug from "./debug/Debug"

import "./Ui.scss"
import { useAnimationFrame } from "@data/lib/hooks"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "@data/const"

function HeightController() {
    let currentRef = useRef<HTMLDivElement>(null)
    let wrapperRef = useRef<HTMLDivElement>(null)
    let tickCount = 5

    useAnimationFrame(() => {
        if (!currentRef.current || !wrapperRef.current?.children) {
            return
        }

        let { player } = store.getState()
        let y = (player.position.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE)

        currentRef.current.style.height = (y * 100).toFixed(3) + "%"

        for (let i = 1; i < wrapperRef.current.children.length - 2; i++) {
            let item = wrapperRef.current.children[i] as HTMLElement
            let currentY = 1 - ((i - 1) / (tickCount - 1))

            if (i === wrapperRef.current.children.length - 3) {
                return
            }

            if (currentY > y) {
                item.style.background = ""
            } else {
                item.style.background = "black"
            }
        }
    })

    return (
        <div
            ref={wrapperRef}
            className="height-controller"
        >
            <div className="height-controller__h">H</div>

            {Array.from({ length: tickCount }).fill(null).map((i, index) => {
                return (
                    <div className="height-controller__tick" key={index} />
                )
            })}

            <div ref={currentRef} className="height-controller__current" />
            <div className="height-controller__l">L</div>
        </div>
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

            <p
                className={"level"}
                style={{
                    display: boss?.state === BossState.OUTRO ? "block" : "none"
                }}
            >
                Level {level}
            </p>
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
            <HeightController />
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
            {ready && state === "intro" && (
                <div className="intro">
                    Untitled <br />
                    retro shooter
                </div>
            )}

            {state === "gameover" && (
                <div className="game-over">Game over</div>
            )}

            {state === "running" && <PlayerUi />}

            {state !== "gameover" && boss.state !== "unknown" && <BossUi />}

            {qs.has("debug") ? <Debug /> : null}
        </>
    )
} 