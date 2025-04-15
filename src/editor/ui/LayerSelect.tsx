import { useState } from "react"
import { useEditorStore } from "../data/store"
import { setActiveObject } from "../data/actions"

export default function LayerSelect() {
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
                    background: "rgba(0, 0, 0, .65)",
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