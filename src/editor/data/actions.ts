import random from "@huth/random";
import { editorStore } from "./store";

export function addObject(data) {
    editorStore.setState({
        objects: [
            ...editorStore.getState().objects,
            {
                id: random.id(),
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