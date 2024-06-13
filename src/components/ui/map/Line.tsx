import { useMemo, useRef } from "react"
import { Vector3 } from "three" 
import { useAnimationFrame } from "../../../data/hooks"
import { ndelta } from "../../../data/utils"
import { useStore } from "../../../data/store"
import { toIsometric } from "./utils"

export default function Line({ index }: { index: number }) {
    let gap = 3.5
    let z = index * gap
    let position = useMemo(() => new Vector3(0, 0, z), [])
    let width = 1000
    let lineRef = useRef<SVGLineElement>(null)
    let distanceTravelled = useRef(0)

    useAnimationFrame((delta) => {
        let player = useStore.getState().player
        let nd = ndelta(delta / 1000)
        let mapPosition = toIsometric(position, [0, 0, 0])

        position.z -= player.speed * nd
        distanceTravelled.current += player.speed * nd

        if (distanceTravelled.current >= gap) {
            position.z = z
            distanceTravelled.current = 0
        }

        lineRef.current?.setAttribute("x1", (mapPosition.x - width * .5).toFixed(1))
        lineRef.current?.setAttribute("y1", (mapPosition.y - width * .5 * .5).toFixed(1))
        lineRef.current?.setAttribute("x2", (mapPosition.x + width * .5).toFixed(1))
        lineRef.current?.setAttribute("y2", (mapPosition.y + width * .5 * .5).toFixed(1))
    })

    return (
        <line
            ref={lineRef}
            strokeWidth={3}
            stroke="rgb(255, 255, 255, 1)"
        />
    )
}