import { setActiveObject, setCameraPosition, setFloorType, toggleAxes, toggleGrid, toggleWorldCenter } from "./data/actions"
import { useEditorStore } from "./data/store"
import generateMap from "./data/generateMap"
import { PointerEvent, useState } from "react"
import { EditorStore } from "./data/types"
import { clamp, map } from "@data/utils"
import ObjectDropper from "./ObjectDropper"
import MapPicker from "./MapPicker"

export default function Toolbar() {
    let store = useEditorStore()
    let { floorType, name } = store

    return (
        <>
            <div
                style={{
                    zIndex: 10000,
                    position: "fixed",
                    top: "1em",
                    display: "flex",
                    gap: "1em",
                    right: "2em",
                    placeItems: "center"
                }}
            >
                <LayerSelect />
                <MapPicker />
            </div>

            <ObjectDropper />

            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    borderBottom: "2.5em transparent solid",
                    right: "2em",
                    left: "2em",
                    zIndex: 10000,
                    display: "flex",
                    borderRadius: 4,
                    placeContent: "center",
                }}
            >
                <button
                    style={{
                        marginRight: "2em",
                        width: "min-content",
                        whiteSpace: "nowrap",
                        cursor: "pointer"
                    }}
                    onClick={() => {
                        let file = generateMap(store, name)

                        let downloadLink = document.createElement("a")
                        let type = "text/plain"
                        let blob = new Blob([file], { type })

                        downloadLink.href = URL.createObjectURL(blob)
                        downloadLink.download = name + ".tsx"
                        downloadLink.click()
                        navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
                    }}
                >
                    &uarr; Export
                </button>

                <select
                    onChange={e => setFloorType(e.currentTarget.value as EditorStore["floorType"])}
                    value={floorType}
                    style={{
                        marginRight: "2em",
                        marginLeft: "auto",
                        width: "min-content",
                        cursor: "pointer"
                    }}
                >
                    {["floor1", "floor2", "floor3", "floor4", "floor5", "floor6"].map((value) => {
                        return (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        )
                    })}
                </select>

                <Visualizers />
                <Panner />
            </div>
        </>
    )
}

function LayerSelect() {
    let [layersVisible, setLayersVisible] = useState(false)
    let activeObjectId = useEditorStore(i => i.activeObjectId)
    let objects = useEditorStore(i => i.objects)

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: ".125em",
                position: "relative",
                zIndex: 10000
            }}
        >
            <label>
                <input
                    checked={layersVisible}
                    type="checkbox"
                    onChange={e => setLayersVisible(e.currentTarget.checked)}
                />  Show objects ({objects.length})
            </label>

            <ul
                style={{
                    maxHeight: "16.75em",
                    overflow: "auto",
                    position: "absolute",
                    marginTop: "1em",
                    border: "1px solid white",
                    width: 300,
                    top: "100%",
                    right: 0,
                    display: layersVisible && objects.length > 0 ? undefined : "none"
                }}
            >
                {objects.sort((a, b) => a.id.localeCompare(b.id)).map(i => {
                    return (
                        <li
                            key={i.id}
                            style={{
                                textAlign: "right",
                                padding: ".35em .65em",
                                borderBottom: "1px solid rgba(255, 255, 255, .31)",
                                background: activeObjectId !== i.id ? undefined : "white",
                                color: activeObjectId !== i.id ? "white" : "black"
                            }}
                        >
                            <button
                                style={{
                                    fontSize: ".875em",
                                    cursor: "pointer",
                                    width: "100%",
                                    textAlign: "right"
                                }}
                                onClick={() => setActiveObject(activeObjectId === i.id ? null : i.id)}
                            >
                                {i.type}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>

    )
}

function Visualizers() {
    let gridVisible = useEditorStore(i => i.gridVisible)
    let axesVisible = useEditorStore(i => i.axesVisible)
    let worldCenterVisible = useEditorStore(i => i.worldCenterVisible)

    return (
        <>
            <label
                style={{
                    display: "flex",
                    placeContent: "center",
                    marginRight: "2em",
                    cursor: "pointer",
                    gap: ".5em"
                }}
            >
                <input
                    type="checkbox"
                    checked={gridVisible}
                    onChange={(e) => toggleGrid(e.currentTarget.checked)}
                />
                Grid
            </label>

            <label
                style={{
                    display: "flex",
                    placeContent: "center",
                    marginRight: "2em",
                    cursor: "pointer",
                    gap: ".5em"
                }}
            >
                <input
                    type="checkbox"
                    checked={axesVisible}
                    onChange={(e) => toggleAxes(e.currentTarget.checked)}
                />
                Axes
            </label>

            <label
                style={{
                    display: "flex",
                    placeContent: "center",
                    marginRight: "2em",
                    cursor: "pointer",
                    gap: ".5em"
                }}
            >
                <input
                    type="checkbox"
                    checked={worldCenterVisible}
                    onChange={(e) => toggleWorldCenter(e.currentTarget.checked)}
                />
                Center
            </label>
        </>
    )
}

function Panner() {
    let [panning, setPanning] = useState(false)
    let z = useEditorStore(i => i.cameraPosition[2])
    let width = 350
    let barCount = 50
    let min = -10
    let max = 40
    let updateCamera = (e: PointerEvent<HTMLDivElement>) => {
        let rect = e.currentTarget.getBoundingClientRect()
        let x = clamp(e.clientX - rect.left, 0, width)

        setCameraPosition(0, 0, Math.round(map(x / width, 0, 1, min, max)))
    }

    return (
        <div
            style={{
                display: "flex",
                height: "1em",
                flex: "0 0",
                flexBasis: width,
                position: "relative",
                cursor: panning ? "grabbing" : "grab"
            }}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                setPanning(true)
                updateCamera(e)
            }}
            onPointerMove={e => {
                if (!panning) {
                    return
                }

                updateCamera(e)
            }}
            onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId)
                setPanning(false)
            }}
        >
            <div
                style={{
                    left: map(z, min, max, 0, width),
                    bottom: "100%",
                    marginBottom: ".25em",
                    translate: "-50% 0",
                    position: "absolute",
                }}
            >
                {z}
            </div>
            {Array.from({ length: barCount + 1 }).fill(null).map((i, index) => {
                return (
                    <div
                        key={index}
                        style={{
                            flex: "0 0 ",
                            flexBasis: width / barCount,
                            boxSizing: "border-box",
                            borderLeftWidth: index === 10 ? 2 : 1,
                            borderLeftColor: "white",
                            borderLeftStyle: "solid",
                            opacity: index === Math.round(map(z, min, max, 0, barCount)) ? 1 : .35,
                            height: "100%",
                        }}
                    />
                )
            })}
        </div>
    )
}