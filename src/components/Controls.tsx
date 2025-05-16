import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import { Camera, Plane, Raycaster, Vector2, Vector3 } from "three"
import { store, useStore } from "../data/store"
import { EDGE_MAX, EDGE_MIN, WORLD_BOTTOM_EDGE, WORLD_LEFT_EDGE, WORLD_TOP_EDGE } from "../data/const"
import { useWindowEvent } from "@data/lib/hooks"
import { clamp, ndelta } from "@data/utils"
import { Tuple2, Tuple3 } from "src/types.global"
import { reset } from "@data/store/world"
import EdgeOverlay from "./EdgeOverlay"

const _floor = new Plane(new Vector3(0, 1, 0), 0)
const _mouse = new Vector2()
const _raycaster = new Raycaster()
const _point = new Vector3()

function toWorldCoords([x, y]: Tuple2, camera: Camera): Tuple3 {
    _mouse.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
    )
    _raycaster.setFromCamera(_mouse, camera)
    _raycaster.ray.intersectPlane(_floor, _point)

    // ignore camera z translation
    _point.z -= camera.position.z

    return _point.toArray()
}

export default function Controls() {
    let keys = useStore(i => i.player.keys)
    let targetPosition = useStore(i => i.player.targetPosition)
    let state = useStore(i => i.state)
    let ready = useStore(i => i.ready)
    let { camera } = useThree()
    let [restartEnabled, setRestartEnabled] = useState(false)
    let [inputEnabled, setInputEnabled] = useState(false)
    let [open, setOpen] = useState(false)

    useEffect(() => {
        if (ready) {
            setOpen(true)
        }
    }, [ready])

    useEffect(() => {
        if (!inputEnabled) {
            for (let key of Object.keys(keys)) {
                keys[key] = false
            }
        }
    }, [inputEnabled, keys])

    useWindowEvent("keydown", (e: KeyboardEvent) => {
        if (!inputEnabled) {
            return
        }

        keys[e.code.replace("Key", "").toLowerCase()] = true
    }, [inputEnabled])

    useWindowEvent("keyup", (e: KeyboardEvent) => {
        keys[e.code.replace("Key", "").toLowerCase()] = false
    })

    useWindowEvent("gamepadconnected", () => { })

    // enable input
    useEffect(() => {
        if (state === "running") {
            let tid = setTimeout(() => setInputEnabled(true), 3_500)

            return () => {
                clearTimeout(tid)
            }
        } else {
            setInputEnabled(false)
        }
    }, [state])

    // enable restart
    useEffect(() => {
        if (state === "gameover") {
            let tid = setTimeout(() => setRestartEnabled(true), 4_000)

            setRestartEnabled(false)

            return () => {
                clearTimeout(tid)
            }
        }
    }, [state])

    // (re)start
    useEffect(() => {
        let onPointerDown = () => {
            let { state } = useStore.getState()
            let canRestart = (state === "gameover" && restartEnabled) || state === "intro"

            if (canRestart && open) {
                setOpen(false)
                setTimeout(() => {
                    setOpen(true)
                    reset("running")
                }, 900)
            }
        }

        window.addEventListener("pointerdown", onPointerDown)

        return () => {
            window.removeEventListener("pointerdown", onPointerDown)
        }
    }, [restartEnabled, open])

    // gamepad
    useFrame((state, delta) => {
        let [gamepad] = navigator.getGamepads()

        if (!gamepad || !inputEnabled) {
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

        targetPosition.x += -x * 20 * delta
        targetPosition.y += y * -14 * delta
        targetPosition.clamp(EDGE_MIN, EDGE_MAX)

        if (a.pressed) {
            document.body.click()
        }
    })

    // keyboard
    useFrame((_, delta) => {
        let xSpeed = 12
        let ySpeed = 10
        let nd = ndelta(delta)
        let { state } = useStore.getState()

        if (Object.entries(keys).length && state === "running" && inputEnabled) {
            if (keys.a) {
                targetPosition.x += xSpeed * nd
            } else if (keys.d) {
                targetPosition.x -= xSpeed * nd
            }

            if (keys.w) {
                targetPosition.y += ySpeed * nd
            } else if (keys.s) {
                targetPosition.y -= ySpeed * nd
            }

            targetPosition.clamp(EDGE_MIN, EDGE_MAX)
        }
    })


    useEffect(() => {
        if (state !== "running" || !inputEnabled) {
            return
        }

        let heightc = document.querySelector(".height-controller") as HTMLElement
        let start: number | null = null
        let previous: number | null = null
        let onPointerDown = (e: PointerEvent) => {
            if (e.pointerType !== "touch") {
                return
            }

            let target = e.currentTarget as HTMLElement

            e.stopImmediatePropagation()
            e.stopPropagation()
            target.setPointerCapture(e.pointerId)
            start = e.clientY
        }
        let onPointerMove = (e: PointerEvent) => {
            if (e.pointerType !== "touch" || start === null) {
                return
            }

            if (previous === null) {
                previous = e.clientY
            }

            e.stopImmediatePropagation()
            e.stopPropagation()
            let { targetPosition } = store.getState().player
            let y = (e.clientY - previous)

            targetPosition.y += -y * .025
            targetPosition.clamp(EDGE_MIN, EDGE_MAX)

            previous = e.clientY
        }
        let onPointerUp = (e: PointerEvent) => {
            if (e.pointerType !== "touch") {
                return
            }

            e.stopImmediatePropagation()
            e.stopPropagation()

            start = null
            previous = null
        }

        heightc.addEventListener("pointerdown", onPointerDown)
        heightc.addEventListener("pointermove", onPointerMove)
        heightc.addEventListener("pointerup", onPointerUp)
        heightc.addEventListener("pointercancel", onPointerUp)
        heightc.addEventListener("pointerleave", onPointerUp)

        return () => {
            heightc.removeEventListener("pointerdown", onPointerDown)
            heightc.removeEventListener("pointermove", onPointerMove)
            heightc.removeEventListener("pointerup", onPointerUp)
            heightc.removeEventListener("pointercancel", onPointerUp)
            heightc.removeEventListener("pointerleave", onPointerUp)
        }
    }, [state, inputEnabled])

    // pointer world
    useEffect(() => {
        if (state !== "running" || !inputEnabled) {
            return
        }

        let movementEvent: PointerEvent | null = null
        let shootEvents: PointerEvent[] = []
        let start: Tuple3 = [0, 0, 0]
        let previous: Tuple3 | null = null
        let onPointerDown = async (e: PointerEvent) => {
            let { pointerType, clientX, clientY } = e

            if (pointerType === "touch") {
                if (clientX > window.innerWidth / 2) {
                    keys.space = true
                    shootEvents.push(e)
                } else if (movementEvent === null) {
                    movementEvent = e
                    start = toWorldCoords([clientX, clientY], camera)
                    previous = [...start]
                }
            } else {
                keys.space = true
            }
        }
        let onPointerMove = ({ pointerId, pointerType, clientX, clientY }: PointerEvent) => {
            let [currentX, , currentZ] = toWorldCoords([clientX, clientY], camera)

            if (pointerType === "touch" && movementEvent?.pointerId === pointerId) {
                if (previous === null) {
                    previous = [currentX, 0, currentZ]
                }

                targetPosition.x += (currentX - previous[0]) * 1.2
                targetPosition.y += (currentZ - previous[2])
                previous = [currentX, 0, currentZ]
            } else if (pointerType === "mouse") {
                let center = [0, WORLD_BOTTOM_EDGE, 26]
                let { world } = store.getState()

                targetPosition.x = clamp((currentX - center[0]) / 5, -1, 1) * WORLD_LEFT_EDGE
                targetPosition.y = clamp((currentZ - center[2]) / (world.diagonal * .25), 0, 1)
                    * (WORLD_TOP_EDGE - WORLD_BOTTOM_EDGE)
                    + WORLD_BOTTOM_EDGE
            }

            targetPosition.clamp(EDGE_MIN, EDGE_MAX)
        }
        let onPointerUp = ({ pointerId, pointerType }: PointerEvent) => {
            shootEvents = shootEvents.filter(event => event.pointerId !== pointerId)

            if (movementEvent?.pointerId === pointerId) {
                movementEvent = null
            }

            if (shootEvents.length === 0 || pointerType === "mouse") {
                keys.space = false
            }
        }

        window.addEventListener("pointerdown", onPointerDown)
        window.addEventListener("pointermove", onPointerMove)
        window.addEventListener("pointerup", onPointerUp)
        window.addEventListener("pointercancel", onPointerUp)
        window.addEventListener("pointerleave", onPointerUp)

        return () => {
            window.removeEventListener("pointerdown", onPointerDown)
            window.removeEventListener("pointermove", onPointerMove)
            window.removeEventListener("pointerup", onPointerUp)
            window.removeEventListener("pointercancel", onPointerUp)
            window.removeEventListener("pointerleave", onPointerUp)
        }
    }, [state, inputEnabled, keys, camera, targetPosition])

    return (
        <EdgeOverlay open={open} />
    )
}