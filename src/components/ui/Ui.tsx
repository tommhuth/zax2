import { useEffect, useRef } from "react"
import { useStore } from "../../data/store"
import { WORLD_BOTTOM_EDGE, WORLD_TOP_EDGE } from "../world/World"
import RotateMe from "./RotateMe"

import "./Ui.scss"

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
    let player = useStore(i => i.player)
    let currentHeightRef = useRef<HTMLDivElement>(null)
    let bars = 5

    useAnimationFrame(() => {
        let player = useStore.getState().player.object

        if (player && currentHeightRef.current) {
            let height = (player.position.y - WORLD_BOTTOM_EDGE) / (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE) 

            currentHeightRef.current.style.height = (height * 100 + 1).toFixed(1) + "%"
        }
    })

    return (
        <>
            <RotateMe />
            
            <div className="height">
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
            <div className="ui">
                {player.health.toFixed(0)}%

                <div>{player.score.toLocaleString("en")}</div>
            </div>
        </>
    )
}