import { Plane, Raycaster, Vector2, Vector3, Camera } from "three"

export const precision = .25

export function roundToNearest(value: number, nearest: number) {
    return Math.round(value / nearest) * nearest
}

let _vector = new Vector2()
let _plane = new Plane(new Vector3(0, 1, 0), 0) // Plane at z = 0 
let _raycaster = new Raycaster()
let _target = new Vector3()

export function from2dTo3d(x: number, y: number, camera: Camera) {
    let nx = (x / window.innerWidth) * 2 - 1
    let ny = -(y / window.innerHeight) * 2 + 1

    _vector.set(nx, ny) // z = 0.5 between near and far planes    
    _raycaster.setFromCamera(_vector, camera)

    return _raycaster.ray.intersectPlane(_plane, _target)
}


export const repeaterEditors = ["tanks", "hangar", "wall1", "wall2", "wall3", "tower1", "tower2"] as const
export const instanceEditors = ["cable", "plant", "dirt"] as const