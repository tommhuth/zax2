import { EditorStore } from "./types"

interface StoredEditorMap {
    savedAt: number
    data: EditorStore
}

export function getEditorMapList() {
    let stored: StoredEditorMap[] = []

    try {
        let existing = JSON.parse(window.localStorage.getItem("editorMapList") as string)

        if (Array.isArray(existing)) {
            stored = existing
        }
    } catch (e) {
        // do nothing
    }

    return stored
}

export function setEditorMapList(list: StoredEditorMap[]) {
    window.localStorage.setItem("editorMapList", JSON.stringify(list))
}

export function getEditorActiveMap() {
    return window.localStorage.getItem("editorActiveMap")
}

export function setEditorActiveMap(id: string | number) {
    window.localStorage.setItem("editorActiveMap", id.toString())
}