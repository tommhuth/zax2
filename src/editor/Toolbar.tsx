import { Tuple3 } from "src/types.global"
import { setCameraPosition, setFloorType, toggleGrid } from "./data/actions"
import { EditorObjectInit, EditorStore, useEditorStore } from "./data/store"
import { instanceEditors, repeaterEditors } from "./data/utils"

const props: Record<string, { size: Tuple3; anchor: Tuple3; rotation?: number }> = {
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

const objs: EditorObjectInit[] = [
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
        type: "box",
        mode: "shape",
        ridgid: false,
    },
    {
        type: "device",
        mode: "shape",
        ridgid: false,
    },
    {
        type: "rockface",
        mode: "shape",
        ridgid: false,
    },
    ...[...repeaterEditors, ...instanceEditors].map(i => {
        return {
            type: i,
            ...props[i]
        }
    })
]

export default function Toolbar() {
    let floorType = useEditorStore(i => i.floorType)
    let gridVisible = useEditorStore(i => i.gridVisible)
    let [, , z] = useEditorStore(i => i.cameraPosition)

    return (
        <> 
            <menu
                style={{
                    zIndex: 10000,
                    position: "fixed",
                    left: 16,
                    top: 16,
                    bottom: 16,
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                {objs.map(i => {
                    return (
                        <li
                            key={i.type}
                            style={{
                                padding: ".5em 1em",
                                textAlign: "center",
                                backgroundColor: "red"
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
            <div
                style={{
                    position: "fixed",
                    bottom: 16,
                    right: 16,
                    zIndex: 10000,
                    display: "flex",
                    padding: ".5em",
                    borderRadius: 4,
                    backgroundColor: "rgba(0 0 0 / .5)",
                    placeContent: "center",
                    gap: 16
                }}
            >
                <label
                    style={{
                        display: "flex",
                        placeContent: "center",
                        gap: ".5em"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={gridVisible}
                        onChange={(e) => toggleGrid(e.currentTarget.checked)}
                    />
                    Show grid
                </label>

                <select
                    onChange={e => setFloorType(e.currentTarget.value as EditorStore["floorType"])}
                    value={floorType}
                >
                    {Array.from({ length: 4 }).fill(null).map((i, index) => {
                        return (
                            <option key={index} value={"floor" + (index + 1)}>
                                floor{index + 1}
                            </option>
                        )
                    })}
                </select>

                <input
                    type="range"
                    style={{ width: 300 }}
                    step={.5}
                    min={-10}
                    max={40}
                    value={z}
                    onChange={(e) => setCameraPosition(
                        0,
                        0,
                        e.currentTarget.valueAsNumber
                    )}
                />

            </div>
        </>
    )
}