import { setName } from "./data/actions"
import { useState } from "react"
import { getActiveMap, getStoreList, setActiveMap, setStoreList } from "./data/localStorage"
import { useEditorStore } from "./data/store"

export default function MapPicker() {
    let [mapListOpen, setMapListOpen] = useState(false)
    let name = useEditorStore(i => i.name)

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
            }}
        >
            <label>
                <input
                    style={{
                        padding: ".75em 1em",
                        background: "white",
                        color: "black",
                        fontFamily: "monospace",
                        width: "22em"
                    }}
                    onChange={e => setName(e.currentTarget.value)}
                    value={name}
                    type="text"
                />
            </label>
            <button
                style={{
                    backgroundColor: "white",
                    padding: "0 .85em",
                    color: "black",
                    cursor: "pointer"
                }}
                onClick={() => setMapListOpen(!mapListOpen)}
            >
                {mapListOpen ? <>&uarr;</> : <>&darr;</>}
            </button>

            <menu
                style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    left: 0,
                    border: "1px solid white",
                    display: mapListOpen ? undefined : "none"
                }}
            >
                {getStoreList().filter(i => i.data.id !== getActiveMap()).map(i => {
                    return (
                        <li
                            key={i.data.id}
                            style={{
                                position: "relative", 
                                borderBottom: "1px solid rgba(255, 255, 255, .31)",
                            }}
                        >
                            <button
                                onClick={() => {
                                    setActiveMap(i.data.id)
                                    window.location.reload()
                                }}
                                style={{
                                    padding: "1em",
                                    fontFamily: "monospace",
                                    cursor: "pointer", 
                                    textAlign: "left",
                                    width: "calc(100% - 4em)"
                                }}
                            >
                                {i.data.name}
                            </button>
                            <button
                                style={{
                                    padding: ".85em .65em",
                                    position: "absolute",
                                    right: ".25em",
                                    top: "50%",
                                    width: "2em",
                                    translate: "0 -50%",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    if (confirm("Delete " + i.data.name + "?")) {
                                        setStoreList(getStoreList().filter(j => j.data.id !== i.data.id))
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
                        onClick={() => {
                            setActiveMap(-1)
                            window.location.reload()
                        }}
                        style={{
                            padding: "1em",
                            fontFamily: "monospace",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        + Create new
                    </button>
                </li>
            </menu>
        </div>
    )
}