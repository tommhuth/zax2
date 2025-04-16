import { useRef } from "react"
import { Vector3 } from "three"
import { WORLD_TOP_EDGE } from "../../../data/const"
import { Tuple3 } from "../../../types.global"
import { useStore } from "../../../data/store"
import { clamp } from "three/src/math/MathUtils.js"
import { toIsometric } from "./utils"
import { useAnimationFrame } from "@data/lib/hooks"

let _position = new Vector3()

interface MarkerProps {
    targetPosition: Vector3
    color?: string
    offset?: Tuple3
}

export default function Marker({
    targetPosition,
    color = "red",
    offset = [0, 0, 0]
}: MarkerProps) {
    let circleRef = useRef<SVGCircleElement>(null)
    let lineRef = useRef<SVGLineElement>(null)
    let player = useStore(i => i.player.position)
    let diagonal = useStore(i => i.world.diagonal)

    useAnimationFrame(() => {
        _position.copy(targetPosition)
        _position.z -= player.z

        let mapPosition = toIsometric(_position, offset)
        let height = -(Math.max(0, targetPosition.y) + offset[1]) * 40
        let distanceToPlayer = Math.abs(player.z - targetPosition.z)

        if (circleRef.current && lineRef.current) {
            let opacity = 1 - clamp((distanceToPlayer - diagonal * .5) / (diagonal * .25), 0, 1)

            circleRef.current.style.opacity = opacity.toFixed(3)
            lineRef.current.style.opacity = opacity.toFixed(3)
        }

        if (
            distanceToPlayer < diagonal
            && targetPosition.y < WORLD_TOP_EDGE * 1.75
        ) {
            circleRef.current?.setAttribute("cx", mapPosition.x.toFixed(1))
            circleRef.current?.setAttribute("cy", (mapPosition.y + height).toFixed(1))
            circleRef.current?.setAttribute("visibility", "visible")

            lineRef.current?.setAttribute("x1", mapPosition.x.toFixed(1))
            lineRef.current?.setAttribute("y1", (mapPosition.y + height).toFixed(1))
            lineRef.current?.setAttribute("x2", mapPosition.x.toFixed(1))
            lineRef.current?.setAttribute("y2", mapPosition.y.toFixed(1))
            lineRef.current?.setAttribute("visibility", "visible")
        } else {
            circleRef.current?.setAttribute("visibility", "hidden")
            lineRef.current?.setAttribute("visibility", "hidden")
        }
    })

    return (
        <>
            <circle
                ref={circleRef}
                r={16}
                fill={color}
            />
            <line
                ref={lineRef}
                stroke={color}
                strokeWidth={10}
                strokeDasharray={"12 10"}
            />
        </>
    )
}