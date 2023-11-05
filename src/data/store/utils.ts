import { InstancedMesh, Object3D } from "three"
import Counter from "../Counter"
import { Store, store } from "../store"

export function updateWorld(data: Partial<Store["world"]>) {
    store.setState({
        world: {
            ...store.getState().world,
            ...data
        }
    })
}

export function setRepeater(name: string, meshes: Object3D[], count: number) {
    store.setState({
        repeaters: {
            ...store.getState().repeaters,
            [name]: {
                meshes,
                index: new Counter(count)
            }
        }
    })
}

export function requestRepeater(name: string) {
    let nextIndex = store.getState().repeaters[name].index.next()
    let mesh = store.getState().repeaters[name].meshes[nextIndex]

    mesh.visible = true

    return mesh
}

export function setInstance(name: string, mesh: InstancedMesh, maxCount: number) {
    store.setState({
        instances: {
            ...store.getState().instances,
            [name]: {
                mesh,
                maxCount,
                index: new Counter(maxCount)
            }
        }
    })
}

export function setLoaded() {
    store.setState({
        loaded: true,
    })
}