import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import random from "@huth/random"
import { EditorStore } from "./types"
import { getEditorActiveMap, getEditorMapList, setEditorActiveMap, setEditorMapList } from "./localStorage"

const id = random.id()
const activeMap = getEditorActiveMap()
const now = new Date()
const initStore = getEditorMapList().find(i => i.data.id === activeMap)

if (!getEditorMapList().some(i => i.data.id === getEditorActiveMap())) {
    setEditorActiveMap(id)
}

const editorStore = create(
    subscribeWithSelector<EditorStore>(() => ({
        id,
        activeObjectId: null,
        cameraPosition: [0, 0, 0],
        gridVisible: false,
        axesVisible: false,
        worldCenterVisible: false,
        floorType: "floor1",
        name: `Untitled (${now.toLocaleDateString("en")} ${now.toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        })})`,
        objects: [],
        ...initStore?.data,
    }))
)
const useEditorStore = editorStore

editorStore.subscribe(state => {
    let list = getEditorMapList()

    setEditorMapList([
        {
            data: state,
            savedAt: Date.now()
        },
        ...list.filter(i => i.data.id !== getEditorActiveMap())
    ])
})

export { editorStore, useEditorStore }