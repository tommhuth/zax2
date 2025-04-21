import { Tuple3 } from "src/types.global"
import { instanceEditors, repeaterEditors } from "../data/utils"
import { useState } from "react"
import { EditorObjectInit } from "../data/types"

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
    ["Actor", "#ff57b3", actors],
    ["World", "#00a2ff", world],
    ["Decoration", "#00ffb3", decorations]
] as const

export default function ObjectDropper() {
    let [hovering, setHovering] = useState<"left" | null>(null)

    return (
        <div
            onMouseEnter={() => setHovering("left")}
            onMouseLeave={() => setHovering(null)}
            className="object-dropper"
            style={{
                translate: !hovering ? "-85% 0" : undefined,
            }}
        >
            {tools.map(([label, backgroundColor, list]) => {
                return (
                    <fieldset
                        className="object-dropper__group"
                        key={label}
                    >
                        <legend
                            className="object-dropper__legend"
                        >
                            {label}
                        </legend>

                        <ul>
                            {list.map(i => {
                                return (
                                    <li
                                        className="object-dropper__item"
                                        key={i.type}
                                        style={{
                                            backgroundColor,
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
                        </ul>
                    </fieldset>
                )
            })}
        </div>
    )
}