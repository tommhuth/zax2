import { InstancedMesh, Material, Object3D } from "three"
import Counter from "../Counter"
import { store } from "."
import { MaterialName } from "../types"
import { Store } from "./types.store"

export function updateWorld(data: Partial<Store["world"]>) {
    store.setState({
        world: {
            ...store.getState().world,
            ...data
        }
    })
}

export function setState(state: Store["state"]) {
    store.setState({
        state,
    })
}

export function createRepeater(name: string, meshes: Object3D[], count: number) {
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
export function setMaterial(name: MaterialName, material: Material) {
    store.setState({
        materials: {
            ...store.getState().materials,
            [name]: material,
        }
    })
}

export function setLoaded() {
    store.setState({
        loaded: true,
    })
}

export function setReady() {
    store.setState({
        ready: true,
    })
}

export function setSetup() {
    store.setState({
        setup: true,
    })
}