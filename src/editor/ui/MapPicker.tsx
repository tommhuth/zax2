import { setName } from "../data/actions"
import { useState } from "react"
import { getEditorActiveMap, getEditorMapList, setEditorActiveMap, setEditorMapList } from "../data/localStorage"
import { useEditorStore } from "../data/store"

export default function MapPicker() {
    let [mapListOpen, setMapListOpen] = useState(false)
    let name = useEditorStore(i => i.name)

    return (
        <div
            className="map-picker"
        >
            <input
                className="map-picker__input"
                onChange={e => setName(e.currentTarget.value)}
                onKeyDown={e => e.nativeEvent.stopImmediatePropagation()}
                value={name}
                type="text"
                aria-label="Current map name"
            />
            <button
                className="map-picker__toggler"
                onClick={() => setMapListOpen(!mapListOpen)}
                aria-label={mapListOpen ? "Close map list" : "Open map list"}
            >
                {mapListOpen ? <>&uarr;</> : <>&darr;</>}
            </button>

            <menu
                className="map-picker__list"
                style={{
                    display: mapListOpen ? undefined : "none",
                }}
            >
                {getEditorMapList().filter(i => i.data.id !== getEditorActiveMap()).map(i => {
                    return (
                        <li
                            key={i.data.id}
                            className="map-picker__item"
                        >
                            <button
                                onClick={() => {
                                    setEditorActiveMap(i.data.id)
                                    window.location.reload()
                                }}
                                className="map-picker__select"
                            >
                                {i.data.name}
                            </button>
                            <button
                                className="map-picker__delete"
                                aria-label="Delete"
                                onClick={() => {
                                    if (confirm("Delete " + i.data.name + "?")) {
                                        setEditorMapList(getEditorMapList().filter(j => j.data.id !== i.data.id))
                                        location.reload()
                                    }
                                }}
                            >
                                ✕
                            </button>
                        </li>
                    )
                })}
                <li>
                    <button
                        className="map-picker__create"
                        onClick={() => {
                            setEditorActiveMap(-1)
                            window.location.reload()
                        }}
                    >
                        + Create new
                    </button>
                </li>
            </menu>
        </div>
    )
}