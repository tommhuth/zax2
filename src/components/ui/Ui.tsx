import { useEffect, useRef } from "react"
import { useStore } from "../../data/store"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../world/World"
import RotateMe from "./RotateMe"

import "./Ui.scss"
import { setState } from "../../data/store/utils"

const useAnimationFrame = callback => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef<number>()
    const previousTimeRef = useRef<number>()

    const animate = time => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current

            callback(deltaTime)
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(requestRef.current as number)
    }, []) // Make sure the effect runs only once
}

export default function Ui() {
    let state = useStore(i => i.state)
    let player = useStore(i => i.player)
    let loaded = useStore(i => i.loaded)
    let currentHeightRef = useRef<HTMLDivElement>(null)
    let bars = 5

    useEffect(() => {
        window.addEventListener("click", () => {
            setState("running")
        })
    }, [])

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
                <h1 className="title">Untitled arcade knockoff   </h1>
                <p className="start">Tap to start</p>
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
        </>
    )
}