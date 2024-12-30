import { useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import { Tuple3 } from "src/types.global"
import { from2dTo3d, precision, roundToNearest } from "./utils"
import { updateObject } from "./actions"
import { useEditorStore } from "./store"
import { EditorObject } from "./types"

export function useEditorObject(id: string) {
    let {
        size: [width, height, depth],
        position,
        rotation,
        offset,
        mode,
        ...rest
    } = useEditorStore(i => i.objects.find(i => i.id === id)) as EditorObject
    let [startY, setStartY] = useState(0)
    let { camera, viewport } = useThree()

    useEffect(() => {
        if (mode === "complete") {
            return
        }

        let onpointerdown = (e: PointerEvent) => {
            switch (mode) {
                case "idle": {
                    let point = from2dTo3d(e.clientX, e.clientY, camera)

                    if (!point) {
                        return
                    }

                    updateObject(id, {
                        position: [
                            roundToNearest(point.x, precision),
                            .125,
                            roundToNearest(point.z, precision)
                        ],
                        size: [0, .25, 0],
                        offset: [0, 0, 0],
                        mode: "shape"
                    })

                    break
                }
                case "shape":
                    updateObject(id, {
                        position: position.map((i, index) => i + offset[index]) as Tuple3,
                        offset: [0, 0, 0],
                        mode: "height"
                    })
                    setStartY(e.clientY)
                    break
                case "height":
                    updateObject(id, {
                        position: position.map((i, index) => i + offset[index]) as Tuple3,
                        offset: [0, 0, 0],
                        size: [Math.abs(width), Math.abs(height), Math.abs(depth)],
                        mode: "complete"
                    })
                    break
            }
        }
        let onpointermove = (e: PointerEvent) => {
            let point = from2dTo3d(e.clientX, e.clientY, camera)

            if (mode === "shape") {
                if (!point) {
                    return
                }

                let w = roundToNearest(point.x - position[0], precision)
                let d = roundToNearest(point.z - position[2], precision)

                updateObject(id, {
                    size: [w, height, d],
                    offset: [w / 2, 0, d / 2],
                })
            } else if (mode === "height") {
                let h = roundToNearest((startY - e.clientY) * .025, precision)

                updateObject(id, {
                    size: [width, Math.abs(h), depth],
                    offset: [0, h / 2, 0],
                })
            }
        }

        window.addEventListener("pointerdown", onpointerdown)
        window.addEventListener("pointermove", onpointermove)

        return () => {
            window.removeEventListener("pointerdown", onpointerdown)
            window.removeEventListener("pointermove", onpointermove)
        }
    }, [mode, camera, viewport, startY, position, width, height, depth, id, offset])

    return {
        width,
        height,
        depth,
        rotation,
        mode,
        offset,
        position: [
            position[0] + offset[0],
            position[1] + offset[1],
            position[2] + offset[2],
        ] as Tuple3,
        ...rest
    }
}