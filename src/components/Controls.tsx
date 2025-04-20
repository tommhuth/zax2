import { useFrame } from "@react-three/fiber"
import { startTransition, useEffect, useRef, useState } from "react"
import { Mesh } from "three"
import { useStore } from "../data/store"
import { EDGE_MAX, EDGE_MIN } from "../data/const"
import { useWindowEvent } from "@data/lib/hooks"

export default function Controls() {
    let { pointerPosition, keys, startPointerPosition } = useStore(i => i.controls)
    let playerTargetPosition = useStore(i => i.player.targetPosition)
    let playerPosition = useStore(i => i.player.position)
    let materials = useStore(i => i.materials)
    let hitboxRef = useRef<Mesh>(null)
    let [isMovingUp, setIsMovingUp] = useState(false)
    let previousZ = useRef<null | number>(null)
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

    useEffect(() => {
        let shootDiv = document.getElementById("shoot") as HTMLElement
        let onTouchStartShoot = () => {
            keys.space = true
        }
        let onTouchEndShoot = () => {
            delete keys.space
        }

        shootDiv.addEventListener("touchstart", onTouchStartShoot)
        shootDiv.addEventListener("touchend", onTouchEndShoot)
        shootDiv.addEventListener("touchcancel", onTouchEndShoot)

        return () => {
            shootDiv.removeEventListener("touchstart", onTouchStartShoot)
            shootDiv.removeEventListener("touchend", onTouchEndShoot)
            shootDiv.removeEventListener("touchcancel", onTouchEndShoot)
        }
    }, [keys])

    useFrame(() => {
        if (previousZ.current !== null) {
            // also move any pointer start position forward too
            pointerPosition.z += playerPosition.z - previousZ.current
        }

        previousZ.current = playerPosition.z
    })

    useFrame(() => {
        if (!hitboxRef.current) {
            return
        }

        hitboxRef.current.position.z = playerPosition.z
    })

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

    return (
        <mesh
            ref={hitboxRef}
            visible={false}
            rotation-x={-Math.PI / 2}
            onPointerUp={() => {
                startTransition(() => setIsMovingUp(false))
            }}
            onPointerMove={({ pointerType, point }) => {
                if (pointerType === "touch") {
                    let depthThreshold = 2

                    if (Math.abs(startPointerPosition.z - point.z) > depthThreshold) {
                        startTransition(() => setIsMovingUp(true))
                    }

                    if (isMovingUp) {
                        playerTargetPosition.y += (point.z - pointerPosition.z)
                    }

                    playerTargetPosition.x += (point.x - pointerPosition.x) * 1.5
                    playerTargetPosition.clamp(EDGE_MIN, EDGE_MAX)
                    pointerPosition.copy(point)
                }
            }}
            onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                    pointerPosition.set(e.point.x, 0, e.point.z)
                    startPointerPosition.set(0, 0, e.point.z)
                }
            }}
            material={materials.white}
        >
            <planeGeometry args={[20, 20, 1, 1]} />
        </mesh>
    )
}