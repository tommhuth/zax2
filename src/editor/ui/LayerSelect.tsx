import { useState } from "react"
import { useEditorStore } from "../data/store"
import { setActiveObject } from "../data/actions"

export default function LayerSelect() {
    let [layersVisible, setLayersVisible] = useState(false)
    let activeObjectId = useEditorStore(i => i.activeObjectId)
    let objects = useEditorStore(i => i.objects)
    let count: Record<string, number> = {}

    return (
        <div className="layer-select">
            <label>
                <input
                    checked={layersVisible}
                    type="checkbox"
                    onChange={e => setLayersVisible(e.currentTarget.checked)}
                />  Show objects ({objects.length})
            </label>

            <ul
                className="layer-select__list"
                style={{
                    display: layersVisible && objects.length > 0 ? undefined : "none"
                }}
            >
                {objects.sort((a, b) => a.id.localeCompare(b.id)).map(i => {
                    if (count[i.type]) {
                        count[i.type]++
                    } else {
                        count[i.type] = 1
                    }

                    return (
                        <li
                            key={i.id}
                            className="layer-select__item"
                            style={{
                                background: activeObjectId !== i.id ? undefined : "white",
                                color: activeObjectId !== i.id ? "white" : "black"
                            }}
                        >
                            <button
                                className="layer-select__button"
                                onClick={() => setActiveObject(activeObjectId === i.id ? null : i.id)}
                            >
                                {i.type} {count[i.type] > 1 ? "#" + count[i.type] : null}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}