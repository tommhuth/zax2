import { useMemo, useRef } from "react"
import { useStore } from "../../data/store"
import { useAnimationFrame } from "../../data/hooks"
import { Vector3 } from "three"
import { clamp, ndelta } from "../../data/utils"

function Line({ z }) {
    let gap = 3.5
    let bz = z * gap
    let p = useMemo(() => new Vector3(0, 0, bz), [])
    let w = 500
    let refline = useRef<SVGLineElement>(null)
    let tr = useRef(0)

    useAnimationFrame((delta) => {
        p.z -= useStore.getState().player.speed * ndelta(delta/1000)
        tr.current += useStore.getState().player.speed * ndelta(delta/1000)
        let pos = toIsometric(p) 

        if (tr.current >= gap) {
            p.z = bz
            tr.current = 0
        }

        refline.current?.setAttribute("x1", pos.x - w)
        refline.current?.setAttribute("y1", pos.y - w * .5)
        refline.current?.setAttribute("x2", pos.x + w)
        refline.current?.setAttribute("y2", pos.y + w * .5)
    })

    return (
        <line
            ref={refline}
            strokeWidth={3}
            stroke="rgb(255, 255, 255, 1)"
        />
    )
}

let width = 1300
let height = 700

function toIsometric(position: Vector3) {
    let by = (position.z) * -10 //-15
    let bx = -position.x * 45
    let x = bx + width * .5 - by * 2
    let y = by + height * .5 + bx * (.5)

    return { x, y }
}

let _p = new Vector3()

function Dot({ position, color = "red" }) {
    let ref = useRef<SVGCircleElement>(null)
    let ref2 = useRef<SVGCircleElement>(null)
    let refline = useRef<SVGLineElement>(null)
    let player = useStore(i => i.player.position)
    let diagonal = useStore(i => i.world.diagonal)

    useAnimationFrame(() => {
        _p.copy(position)
        _p.z -= player.z
        let pos = toIsometric(_p)
        let pos2 = toIsometric(_p.set(_p.x, 0, _p.z))
        let h = -position.y * 40
        let opacity = 1 - clamp((position.z - (player.z + diagonal *.5)) / (diagonal * .25), 0, 1)

        ref.current.style.opacity = opacity
        refline.current.style.opacity = opacity 

        if (position.z - player.z < diagonal) {
            ref.current?.setAttribute("cx", pos.x.toFixed(1))
            ref.current?.setAttribute("cy", (pos.y + h).toFixed(1)) 

            refline.current?.setAttribute("x1", pos.x.toFixed(1))
            refline.current?.setAttribute("y1", (pos.y + h).toFixed(1))
            refline.current?.setAttribute("x2", pos.x.toFixed(1))
            refline.current?.setAttribute("y2", pos.y.toFixed(1))
        }
    })

    return (
        <>
            <circle
                ref={ref}
                r={16}
                fill={color}
            /> 
            <line
                ref={refline}
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

    return (
        <div
            style={{
                position: "absolute",
               
                height: 200,
                
                zIndex: 100000000,
                display: "flex",
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
                }}
            >

                <Dot position={player} color="white" />
                {planes.map(i => <Dot position={i.position} key={i.id} />)}
            </svg>
            <Grid />
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
                translate:"-50% 0",
                bottom: 0,
                maskImage: "radial-gradient(at center 60%, black, transparent 70%)",
            }}
        >
            {new Array(15).fill(null).map((i, index, list) => {
                return <Line z={index - list.length * .35} key={index} />
            })}
        </svg>
    )
}