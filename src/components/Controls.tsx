import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import { Camera, Plane, Raycaster, Vector2, Vector3 } from "three"
import { useStore } from "../data/store"
import { EDGE_MAX, EDGE_MIN } from "../data/const"
import { useWindowEvent } from "@data/lib/hooks"
import { ndelta } from "@data/utils"
import { Tuple2, Tuple3 } from "src/types.global"

const _floor = new Plane(new Vector3(0, 1, 0), 0)
const _mouse = new Vector2()
const _raycaster = new Raycaster()
const _point = new Vector3()

function toWorldCoords(
    [x, y]: Tuple2,
    camera: Camera,
): Tuple3 {
    _mouse.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
    )
    _raycaster.setFromCamera(_mouse, camera)
    _raycaster.ray.intersectPlane(_floor, _point)

    _point.z -= camera.position.z

    return _point.toArray()
}

export default function Controls() {
    let { keys } = useStore(i => i.controls)
    let playerTargetPosition = useStore(i => i.player.targetPosition)
    let state = useStore(i => i.state)
    let [, setEventGamepad] = useState<Gamepad | null>(null)

    useWindowEvent("keydown", (e: KeyboardEvent) => {
        keys[e.code.replace("Key", "").toLowerCase()] = true
    })

    useWindowEvent("keyup", (e: KeyboardEvent) => {
        keys[e.code.replace("Key", "").toLowerCase()] = false
    })

    useWindowEvent("gamepadconnected", (e: GamepadEvent) => {
        setEventGamepad(e.gamepad)
    })

    useWindowEvent("gamepaddisconnected", () => {
        setEventGamepad(null)
    })

    // keyboard input
    useFrame((_, delta) => {
        let xSpeed = 12
        let ySpeed = 10
        let nd = ndelta(delta)
        let { state } = useStore.getState()

        if (Object.entries(keys).length && state === "running") {
            if (keys.a) {
                playerTargetPosition.x += xSpeed * nd
            } else if (keys.d) {
                playerTargetPosition.x -= xSpeed * nd
            }

            if (keys.w) {
                playerTargetPosition.y += ySpeed * nd
            } else if (keys.s) {
                playerTargetPosition.y -= ySpeed * nd
            }

            playerTargetPosition.clamp(EDGE_MIN, EDGE_MAX)
        }
    })

    let { camera } = useThree()

    useEffect(() => {
        if (state !== "running") {
            return
        }

        let movementEvents: PointerEvent[] = []
        let start: Tuple3 = [0, 0, 0]
        let previous: Tuple3 = [0, 0, 0]
        let pointerdown = async (e: PointerEvent) => {
            if (e.pointerType === "touch") {
                if (e.clientX > window.innerWidth / 2) {
                    keys.space = true
                } else if (movementEvents.length === 0) {
                    movementEvents.push(e)
                    start = toWorldCoords([e.clientX, e.clientY], camera)
                    previous = [...start]
                }
            } else {
                keys.space = true
            }
        }
        let pointermove = (e: PointerEvent) => {
            if (!movementEvents.find(i => e.pointerId === i.pointerId) && e.pointerType === "touch") {
                return
            }


            let current = toWorldCoords([e.clientX, e.clientY], camera)
            let x = (current[0] - previous[0]) * (e.pointerType === "mouse" ? .35 : 1.5)
            let y = (current[2] - previous[2]) * (e.pointerType === "mouse" ? .35 : 1.25)

            playerTargetPosition.x += x
            playerTargetPosition.y += y
            playerTargetPosition.clamp(EDGE_MIN, EDGE_MAX)

            previous = [current[0], 0, current[2]]
        }
        let pointerup = (e: PointerEvent) => {
            movementEvents = movementEvents.filter(i => i.pointerId !== e.pointerId)
            keys.space = false
        }

        window.addEventListener("pointerdown", pointerdown)
        window.addEventListener("pointermove", pointermove)
        window.addEventListener("pointerup", pointerup)
        window.addEventListener("pointercancel", pointerup)

        return () => {
            window.removeEventListener("pointerdown", pointerdown)
            window.removeEventListener("pointermove", pointermove)
            window.removeEventListener("pointerup", pointerup)
            window.removeEventListener("pointercancel", pointerup)
        }
    }, [state, keys, camera, playerTargetPosition])

    // gamepad
    useFrame((state, delta) => {
        let [gamepad] = navigator.getGamepads()

        if (!gamepad) {
            return
        }

        let a = gamepad.buttons[0]
        let [x, y] = gamepad.axes
        let deadzone = .25

        if (Math.abs(x) > deadzone) {
            x += deadzone * -Math.sign(x)
        } else {
            x = 0
        }

        if (Math.abs(y) > deadzone * 2) {
            y += deadzone * -Math.sign(y) * 2
        } else {
            y = 0
        }

        playerTargetPosition.x += -x * 20 * delta
        playerTargetPosition.y += y * -14 * delta
        playerTargetPosition.clamp(EDGE_MIN, EDGE_MAX)

        if (a.pressed) {
            document.body.click()
        }
    })

    return null
}