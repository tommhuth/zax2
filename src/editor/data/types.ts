import { Tuple3 } from "src/types.global"

export type EditorObjectInit = {
    type: EditorObject["type"]
    offset?: Tuple3
} & Partial<EditorObject>

export interface EditorObject {
    id: string;
    type: "box" | "device" | "rockface"
    | "turret" | "barrel" | "rocket" | "plane"
    | "tanks" | "hangar" | "wall1" | "wall2" | "wall3" | "tower1" | "tower2"
    | "plant" | "cable" | "dirt" | "grass"
    position: Tuple3
    anchor: Tuple3
    size: Tuple3
    offset: Tuple3
    scale: Tuple3
    rotation: number
    uniformScaler: number
    invisible: boolean
    mode: "idle" | "shape" | "height" | "complete"
}

export interface EditorStore {
    id: string
    activeObjectId: string | null
    objects: EditorObject[]
    cameraPosition: Tuple3
    gridVisible: boolean
    axesVisible: boolean
    worldCenterVisible: boolean
    name: string
    floorType: "floor1" | "floor2" | "floor3" | "floor4" | "floor5"
}