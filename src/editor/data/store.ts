import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware" 
import { Tuple3 } from "src/types.global";

export type EditorObjectInit = {
    type: EditorObject["type"]
    offset?: Tuple3
    ridgid?: boolean
} & Partial<EditorObject>

export interface EditorObject {
    id: string;
    type: "barrel" | "obstacle" | "turret"
    position: Tuple3
    anchor: Tuple3
    size: Tuple3
    offset: Tuple3
    rotation: number
    ridgid: boolean
    invisible: boolean
    mode: "idle" | "shape" | "height" | "complete"
}

export interface EditorStore {
    activeObject: string | null
    objects: EditorObject[]
}

const initStore: EditorStore | undefined = JSON.parse(
    window.localStorage.getItem("editorStore") || "{}"
)

const editorStore = create(
    subscribeWithSelector<EditorStore>(() => ({
        activeObject: null,
        objects: [],
        ...initStore,
    }))
)

const useEditorStore = editorStore

editorStore.subscribe(state => {
    window.localStorage.setItem("editorStore", JSON.stringify(state))
})

export { editorStore, useEditorStore }