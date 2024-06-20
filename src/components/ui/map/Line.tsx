import { useMemo, useRef } from "react"
import { Vector3 } from "three"
import { useAnimationFrame } from "../../../data/hooks"
import { useStore } from "../../../data/store"
import { toIsometric } from "./utils"

export default function Line({ index }: { index: number }) {
    let gap = 3.5
    let z = index * gap
    let position = useMemo(() => new Vector3(0, 0, z), [])
    let width = 1000
    let lineRef = useRef<SVGLineElement>(null)
    let distanceTravelled = useRef(0)
    let lastPosition = useRef(0)

    useAnimationFrame(() => {
        let player = useStore.getState().player
        let mapPosition = toIsometric(position, [0, 0, 0])
        let speed = player.position.z - lastPosition.current

        position.z -= speed
        distanceTravelled.current += speed
        lastPosition.current = player.position.z

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