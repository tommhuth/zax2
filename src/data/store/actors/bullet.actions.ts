import random from "@huth/random"
import { store } from "../index"
import { ColorRepresentation, Matrix4, Quaternion, Vector3 } from "three"
import { updateWorld } from "../utils"
import { BULLET_LIGHT_COUNT, BULLET_SIZE } from "../../const"
import Counter from "@data/Counter"
import { Tuple3 } from "src/types.global"
import { Owner } from "@data/types"
import LineSegment from "@data/LineSegment"

let _matrix4 = new Matrix4()
let _translation = new Vector3()
let _scale = new Vector3(1, 1, 1)
let _yAxis = new Vector3(0, 1, 0)
let _quaternion = new Quaternion()

let lightIndex = new Counter(BULLET_LIGHT_COUNT)

interface CreateBulletParams {
    position: Tuple3
    rotation?: number
    owner: Owner
    speed: number
    color?: ColorRepresentation
}

export function createBullet({
    position,
    rotation = 0,
    owner,
    speed,
    color = "#fff",
}: CreateBulletParams) {
    let id = random.id()
    let { instances, world } = store.getState()
    // default dir = left side screen (positive x)
    let direction = new Vector3(1, 0, 0)
        .applyMatrix4(_matrix4.compose(
            _translation,
            _quaternion.setFromAxisAngle(_yAxis, rotation),
            _scale,
        )).normalize()
    let line = new LineSegment(
        new Vector3(...position),
        direction,
        BULLET_SIZE
    )

    updateWorld({
        bullets: [
            {
                line,
                id,
                mounted: false,
                index: instances.line.index.next(),
                color,
                speed,
                owner,
                rotation,
                lightIndex: lightIndex.next(),
            },
            ...world.bullets,
        ]
    })
}

export function removeBullet(ids: string[]) {
    updateWorld({
        bullets: store.getState().world.bullets.filter(i => !ids.includes(i.id))
    })
}