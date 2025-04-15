import { EditorStore } from "./types"

export interface StoredEditorMap {
    savedAt: number
    data: EditorStore
}

const MAP_LIST_KEY = "editorMapList"
const ACTIVE_MAP_KEY = "editorActiveMap"

export function getEditorMapList() {
    let stored: StoredEditorMap[] = []

    try {
        let existing = JSON.parse(window.localStorage.getItem(MAP_LIST_KEY) as string)

        if (Array.isArray(existing)) {
            stored = existing
        }
    } catch (e) {
        // do nothing
    }

    return stored
}

export function setEditorMapList(list: StoredEditorMap[]) {
    window.localStorage.setItem(MAP_LIST_KEY, JSON.stringify(list))
}

export function getEditorActiveMap() {
    return window.localStorage.getItem(ACTIVE_MAP_KEY)
}

export function setEditorActiveMap(id: string | number) {
    window.localStorage.setItem(ACTIVE_MAP_KEY, id.toString())
}