import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { Tuple3 } from "src/types.global"

export type EditorObjectInit = {
    type: EditorObject["type"]
    offset?: Tuple3
    ridgid?: boolean
} & Partial<EditorObject>

export interface EditorObject<T = null> {
    data: T
    id: string;
    type: "box" | "device" | "rockface"
    | "turret" | "barrel"
    | "tanks" | "hangar" | "wall1" | "wall2" | "wall3" | "tower1" | "tower2"
    | "plant" | "cable" | "dirt"
    position: Tuple3
    anchor: Tuple3
    size: Tuple3
    offset: Tuple3
    scale: Tuple3
    rotation: number
    ridgid: boolean
    invisible: boolean
    mode: "idle" | "shape" | "height" | "complete"
}

export interface EditorStore {
    activeObject: string | null
    objects: EditorObject[]
    cameraPosition: Tuple3
    gridVisible: boolean
    floorType: "floor1" | "floor2" | "floor3" | "floor4"
}

const initStore: EditorStore | undefined = JSON.parse(
    window.localStorage.getItem("editorStore") || "{}"
)

const editorStore = create(
    subscribeWithSelector<EditorStore>(() => ({
        activeObject: null,
        cameraPosition: [0, 0, 0],
        gridVisible: false,
        floorType: "floor1",
        objects: [],
        ...initStore,
    }))
)

const useEditorStore = editorStore

editorStore.subscribe(state => {
    window.localStorage.setItem("editorStore", JSON.stringify(state))
})

export { editorStore, useEditorStore }