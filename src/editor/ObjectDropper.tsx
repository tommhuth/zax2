import { Tuple3 } from "src/types.global"
import { instanceEditors, repeaterEditors } from "./data/utils"
import { useState } from "react"
import { EditorObjectInit } from "./data/types"

const decorationParams: Record<string, { size: Tuple3; anchor: Tuple3; rotation?: number }> = {
    wall1: {
        rotation: Math.PI,
        size: [6, 3, 7.1],
        anchor: [-3, 1.5, 0]
    },
    wall2: {
        rotation: Math.PI,
        size: [5, 3.5, 7.1],
        anchor: [-1.5, 1.75, 0]
    },
    wall3: {
        rotation: Math.PI,
        size: [5, 3.5, 7.1],
        anchor: [-2.5, 1.75, 0]
    },
    tower1: {
        rotation: Math.PI,
        size: [4, 4, 2],
        anchor: [-2, 2, 0]
    },
    tower2: {
        rotation: Math.PI,
        size: [6, 4, 2],
        anchor: [-2, 2, 0]
    },
    hangar: {
        rotation: Math.PI,
        size: [7, 2.5, 6],
        anchor: [-3, 1.25, 0]
    },
    tanks: {
        size: [8, 4, 8],
        anchor: [1, 2, 0]
    },
    plant: {
        size: [2, 2, 2],
        anchor: [0, 1, 0]
    },
    dirt: {
        size: [4, .5, 4],
        anchor: [0, .25, 0]
    },
    cable: {
        size: [6, 1, 6],
        anchor: [0, .5, 0]
    }
}

const actors: EditorObjectInit[] = [
    {
        type: "barrel",
        size: [2, 1.85, 2],
        anchor: [0, 1.85 / 2, 0],
    },
    {
        type: "turret",
        size: [1.85, 4.5, 1.85],
    },
    {
        type: "plane",
        size: [1, 1.5, 2],
    },
    {
        type: "rocket",
        size: [2, 1, 2],
    },
]

const world: EditorObjectInit[] = [
    {
        type: "box",
        mode: "shape",
    },
    {
        type: "device",
        mode: "shape",
    },
    {
        type: "rockface",
        mode: "shape",
    },
    {
        type: "empty",
        mode: "shape",
        invisible: true
    },
]

const decorations: EditorObjectInit[] = [
    {
        type: "grass",
        size: [6, 1.75, 12],
    },
    ...[...repeaterEditors, ...instanceEditors].map(i => {
        return {
            type: i,
            ...decorationParams[i]
        }
    })
]

const tools = [
    ["Actor", "red", actors],
    ["World", "blue", world],
    ["Decoration", "green", decorations]
] as const

export default function ObjectDropper() {
    let [hovering, setHovering] = useState<"left" | null>(null)

    return (
        <div
            onMouseEnter={() => setHovering("left")}
            onMouseLeave={() => setHovering(null)}
            style={{
                zIndex: 10000,
                position: "fixed",
                transition: "all .45s",
                translate: !hovering ? "-85% 0" : undefined,
                borderRight: "1em solid transparent",
                top: "1em",
                width: 200,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {tools.map(([label, color, list]) => {
                return (
                    <div
                        style={{
                            position: "relative",
                            marginBottom: ".25em",
                        }}
                        key={label}
                    >
                        <div
                            style={{
                                writingMode: "vertical-lr",
                                position: "absolute",
                                left: "100%",
                                marginLeft: ".25em",
                                top: 0,
                            }}
                        >
                            {label}
                        </div>
                        <menu>
                            {list.map(i => {
                                return (
                                    <li
                                        key={i.type}
                                        style={{
                                            padding: ".5em 1.5em",
                                            textAlign: "right",
                                            marginBottom: "1px",
                                            backgroundColor: color,
                                            cursor: "grab",
                                        }}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.dropEffect = "move"
                                            e.dataTransfer.setData("application/json", JSON.stringify(i))
                                        }}
                                    >
                                        {i.type}
                                    </li>
                                )
                            })}
                        </menu>
                    </div>
                )
            })}
        </div>
    )
}