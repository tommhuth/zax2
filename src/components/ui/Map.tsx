import { useMemo, useRef, useState } from "react"
import { useStore } from "../../data/store"
import { useAnimationFrame } from "../../data/hooks"
import { Vector3 } from "three"
import { clamp, ndelta } from "../../data/utils"
import { WORLD_TOP_EDGE } from "../../data/const"
import { Tuple3 } from "../../types"

function Line({ index }: { index: number }) {
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

let width = 1300
let height = 700

function toIsometric(position: Vector3, offset: Tuple3) {
    let by = (offset[1] + position.z) * -10
    let bx = -position.x * 45
    let x = bx + width * .5 - by * 2
    let y = by + height * .5 + bx * (.5)

    return { x, y }
}

let _position = new Vector3()

interface DotProps {
    targetPosition: Vector3
    color?: string
    offset?: Tuple3
}

function Dot({
    targetPosition,
    color = "red",
    offset = [0, 0, 0]
}: DotProps) {
    let circleRef = useRef<SVGCircleElement>(null)
    let lineRef = useRef<SVGLineElement>(null)
    let player = useStore(i => i.player.position)
    let diagonal = useStore(i => i.world.diagonal)
    let [active, setActive] = useState(false)

    useAnimationFrame(() => {
        _position.copy(targetPosition)
        _position.z -= player.z

        let mapPosition = toIsometric(_position, offset)
        let height = -(targetPosition.y + offset[1]) * 40
        let distanceToPlayer = Math.abs(player.z - targetPosition.z)

        if (circleRef.current && lineRef.current) {
            let opacity = 1 - clamp((distanceToPlayer - diagonal * .5) / (diagonal * .25), 0, 1)

            circleRef.current.style.opacity = opacity.toFixed(3)
            lineRef.current.style.opacity = opacity.toFixed(3)
        }

        if (
            distanceToPlayer < diagonal 
            && targetPosition.y < WORLD_TOP_EDGE * 1.5
        ) {
            circleRef.current?.setAttribute("cx", mapPosition.x.toFixed(1))
            circleRef.current?.setAttribute("cy", (mapPosition.y + height).toFixed(1))

            lineRef.current?.setAttribute("x1", mapPosition.x.toFixed(1))
            lineRef.current?.setAttribute("y1", (mapPosition.y + height).toFixed(1))
            lineRef.current?.setAttribute("x2", mapPosition.x.toFixed(1))
            lineRef.current?.setAttribute("y2", mapPosition.y.toFixed(1))

            !active && setActive(true)
        } else {
            setActive(false)
        }
    })

    if (!active) {
        return null
    }

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
                strokeWidth={5}
                strokeDasharray={"12 10"}
            />
        </>
    )
}

export default function Map() {
    let player = useStore(i => i.player.position)
    let planes = useStore(i => i.world.planes)
    let rockets = useStore(i => i.world.rockets)
    let turrets = useStore(i => i.world.turrets)
    let ready = useStore(i => i.ready)

    return (
        <div
            style={{
                position: "absolute",
                height: 200,
                zIndex: 100000000,
                display: ready ? "flex" : "none",
                placeItems: "center",
                placeContent: "center",
                pointerEvents: "none"
            }}
            className="map"
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{
                    width: "clamp(8em, 30vw, 350px)",
                    overflow: "visible",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Dot targetPosition={player} color="white" />
                {planes.map(i => <Dot targetPosition={i.position} key={i.id} />)}
                {turrets.map(i => <Dot targetPosition={i.position} key={i.id} color="orange" offset={[0, 2, 0]} />)}
                {rockets.map(i => <Dot targetPosition={i.position} key={i.id} color="blue" />)}
            </svg>
            <Grid />
            <div
                style={{
                    height: "100%",
                    width: "clamp(8em, 30vw, 350px)",
                    overflow: "visible",
                    zIndex: -1,
                    position: "absolute",
                    left: "50%",
                    backgroundImage: "radial-gradient(at center, black 5%, transparent 70%)",
                    translate: "-50% 0",
                }}
            />
        </div>
    )
}

function Grid() {
    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
                width: "clamp(8em, 30vw, 350px)",
                overflow: "visible",
                zIndex: 0,
                position: "absolute",
                left: "50%",
                translate: "-50% 0",
                bottom: 0,
                maskImage: "radial-gradient(at center 60%, black, transparent 70%)",
            }}
        >
            {new Array(15).fill(null).map((i, index, list) => {
                return <Line index={index - list.length * .35} key={index} />
            })}
        </svg>
    )
}