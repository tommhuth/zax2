import { EditorStore } from "./types"

interface LocaleStorageMapStore {
    savedAt: number
    data: EditorStore
}

export function getStoreList() {
    let stored: LocaleStorageMapStore[] = []

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

export function setStoreList(list: LocaleStorageMapStore[]) {
    window.localStorage.setItem("editorMapList", JSON.stringify(list))
}

export function getActiveMap() {
    return window.localStorage.getItem("editorActiveMap")
}

export function setActiveMap(id: string | number) {
    return window.localStorage.setItem("editorActiveMap", id.toString())
}