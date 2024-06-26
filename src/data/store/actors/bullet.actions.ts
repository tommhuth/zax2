import random from "@huth/random"
import { store } from "../index"
import { Box3, ColorRepresentation, Matrix4, Quaternion, Vector3 } from "three"
import { updateWorld } from "../utils"
import { BULLET_LIGHT_COUNT, BULLET_SIZE } from "../../const"
import Counter from "@data/Counter"
import { Tuple3 } from "src/types.global"
import { Owner } from "@data/types"

let _matrix4 = new Matrix4()
let _translation = new Vector3()
let _position = new Vector3()
let _size = new Vector3()
let _scale = new Vector3(1, 1, 1)
let _yAxis = new Vector3(0, 1, 0)
let _quaternion = new Quaternion()

let lightIndex = new Counter(BULLET_LIGHT_COUNT)

interface CreateBulletParams {
    position: Tuple3
    rotation?: number
    owner: Owner
    size?: Tuple3
    speed: number
    color?: ColorRepresentation
}

export function createBullet({
    position,
    rotation = 0,
    owner,
    size = BULLET_SIZE,
    speed,
    color = "#fff",
}: CreateBulletParams) {
    let id = random.id()
    let { instances, world } = store.getState()
    // since rotation is always incremenets of 90deg, 
    // this still works with aabb
    let aabb = new Box3()
        .setFromCenterAndSize(_position.set(...position), _size.set(...size))
        .applyMatrix4(_matrix4.compose(
            _translation,
            _quaternion.setFromAxisAngle(_yAxis, rotation),
            _scale,
        ))

    updateWorld({
        bullets: [
            {
                position: new Vector3(...position),
                id,
                mounted: false,
                index: instances.line.index.next(),
                aabb,
                color,
                size,
                direction: [Math.cos(rotation), 0, Math.sin(rotation)],
                speed,
                owner,
                rotation,
                lightIndex: lightIndex.next(),
            },
            ...world.bullets,
        ]
    })
}

export function removeBullet(...ids: string[]) {
    updateWorld({
        bullets: store.getState().world.bullets.filter(i => !ids.includes(i.id))
    })
}