import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { EditorObject } from "./hooks";

export interface EditorStore {
    activeObject: string | null
    objects: (Partial<EditorObject> & {
        id: string;
        type: string;
    })[]
}

const editorStore = create(
    subscribeWithSelector<EditorStore>(() => ({
        activeObject: null,
        objects: []
    }))
)

const useEditorStore = editorStore

export { editorStore, useEditorStore }