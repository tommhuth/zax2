import { Vector3 } from "three"
import { Tuple3 } from "../../../types.global"

export const width = 1300
export const height = 700

export function toIsometric(position: Vector3, offset: Tuple3) {
    let by = (offset[1] + position.z) * -10
    let bx = -position.x * 40
    let x = bx + width * .5 - by * 2
    let y = by + height * .5 + bx * (.5)

    return { x, y }
}