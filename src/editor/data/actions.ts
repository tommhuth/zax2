import random from "@huth/random"
import { EditorObject, EditorStore, editorStore } from "./store"
import { Tuple3 } from "src/types.global"

export function addObject(data: { position: Tuple3; type: EditorObject["type"] }) {
    editorStore.setState({
        objects: [
            ...editorStore.getState().objects,
            {
                data: null,
                id: random.id(),
                rotation: 0,
                offset: [0, 0, 0],
                size: [0, 0, 0],
                invisible: false,
                ridgid: true,
                mode: "complete",
                anchor: [0, 0, 0],
                scale: [1, 1, 1],
                ...data
            }
        ]
    })
}

export function removeObject(id: string) {
    editorStore.setState({
        objects: editorStore.getState().objects.filter(i => i.id !== id)
    })
}

export function setActiveObject(id: string | null) {
    editorStore.setState({
        activeObject: id
    })
}

export function setCameraPosition(...args: Tuple3) {
    editorStore.setState({
        cameraPosition: args
    })
}

export function setFloorType(type: EditorStore["floorType"]) {
    editorStore.setState({
        floorType: type
    })
}

export function toggleGrid(visible: boolean) {
    editorStore.setState({
        gridVisible: visible
    })
}

export function updateObject(id: string, props: Partial<EditorObject>) {
    let objects = editorStore.getState().objects

    editorStore.setState({
        objects: [
            ...objects.filter(i => i.id !== id),
            {
                ...objects.find(i => i.id === id) as EditorObject,
                ...props,
            }
        ]
    })
}