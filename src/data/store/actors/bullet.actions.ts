import random from "@huth/random"
import { store } from "../index" 
import { Box3, Matrix4, Quaternion, Vector3 } from "three" 
import { updateWorld } from "../utils"
import { BULLET_SIZE } from "../../const"

let _mat4 = new Matrix4()
let _translation = new Vector3()
let _scale = new Vector3(1, 1, 1)
let _yAxis = new Vector3(0, 1, 0)

export function createBullet({
    position = [0, 0, 0],
    rotation = 0,
    owner,
    size = BULLET_SIZE,
    speed = 10,
    damage,
    color = "#fff",
}) {
    let id = random.id()
    let { instances, world } = store.getState()
    // since rotation is always incremenets of 90deg, this still works with aabb
    let aabb = new Box3()
        .setFromCenterAndSize(new Vector3(...position), new Vector3(...size))
        .applyMatrix4(_mat4.compose(
            _translation,
            new Quaternion().setFromAxisAngle(_yAxis, rotation),
            _scale,
        ))

    updateWorld({
        bullets: [
            {
                position: new Vector3(...position),
                id,
                damage,
                mounted: false,
                index: instances.line.index.next(),
                aabb,
                color,
                size,
                direction: [Math.cos(rotation), 0, Math.sin(rotation)],
                speed,
                owner,
                rotation,
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