import { getEditorMapList, setEditorMapList, StoredEditorMap } from "../data/localStorage"

const pickerOptions = {
    types: [
        {
            accept: {
                "application/json": [".json"],
                "text/plain": [".json"],
            },
        },
    ],
    suggestedName: "maps.json",
    excludeAcceptAllOption: true,
    multiple: false,
}

const SAVE_TYPE = "ZAXSAVE_1"

interface SaveState {
    data: StoredEditorMap[]
    savedAt: string
    type: typeof SAVE_TYPE
}

export default function SaveFileButtons() {
    return (
        <>
            <button
                type="button"
                style={{
                    cursor: "pointer"
                }}
                onClick={async () => {
                    const fileHandle = await window.showSaveFilePicker(pickerOptions)
                    const file = await fileHandle.createWritable()
                    const save: SaveState = {
                        savedAt: new Date().toLocaleString("en"),
                        type: SAVE_TYPE,
                        data: getEditorMapList()
                    }

                    await file.write(JSON.stringify(save, null, 4))
                    await file.close()
                }}
            >
                &uarr; Export
            </button>

            <button
                type="button"
                style={{
                    cursor: "pointer",
                    marginRight: "2em"
                }}
                onClick={async () => {
                    const [fileHandle] = await window.showOpenFilePicker(pickerOptions)
                    const file = await fileHandle.getFile()
                    const content = await file.text()
                    const save = JSON.parse(content) as SaveState

                    if (save?.type === SAVE_TYPE && Array.isArray(save.data)) {
                        setEditorMapList(save.data)
                        document.location.reload()
                    }
                }}
            >
                &darr; Import
            </button>
        </>
    )
}