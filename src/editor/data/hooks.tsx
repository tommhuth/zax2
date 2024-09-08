import { useThree } from "@react-three/fiber"
import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { Tuple3 } from "src/types.global"
import { from2dTo3d, precision, roundToNearest } from "./utils"
import { Html } from "@react-three/drei"
import VectorInput from "../VectorInput"
import { removeObject, setActiveObject } from "./actions"
import { useEditorStore } from "./store"

interface UseSizeCursorParams {
    mode?: "idle" | "shape" | "height" | "complete"
    size?: Tuple3
    position?: Tuple3
}

export interface EditorObject {
    position: Tuple3
    size: Tuple3
    mode: UseSizeCursorParams["mode"]
}

const context = createContext<ReturnType<typeof useEditorSizer>>(
    {} as ReturnType<typeof useEditorSizer>
)

export function useEditorObject() {
    return useContext(context)
}

export function useEditorSizer({
    mode: incomingMode = "idle",
    size: incomingSize = [0, 0, 0],
    position: incomingPosition = [0, 0, 0]
}: UseSizeCursorParams = {}) {
    let [mode, setMode] = useState<UseSizeCursorParams["mode"]>(incomingMode)
    let [width, setWidth] = useState(incomingSize[0])
    let [height, setHeight] = useState(incomingSize[1])
    let [depth, setDepth] = useState(incomingSize[2])
    let [position, setPosition] = useState<Tuple3>(incomingPosition)
    let [offset, setOffset] = useState<Tuple3>([0, 0, 0])
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

                    setPosition([
                        roundToNearest(point.x, precision),
                        0,
                        roundToNearest(point.z, precision)
                    ])
                    setHeight(.25)
                    setOffset([0, 0, 0])
                    setMode("shape")
                    break
                }
                case "shape":
                    setStartY(e.clientY)
                    setOffset([0, 0, 0])
                    setPosition(position.map((i, index) => i + offset[index]) as Tuple3)
                    setMode("height")
                    break
                case "height":
                    setOffset([0, 0, 0])
                    setPosition(position.map((i, index) => i + offset[index]) as Tuple3)
                    setMode("complete")
                    break
            }
        }
        let onpointermove = (e: PointerEvent) => {
            let point = from2dTo3d(e.clientX, e.clientY, camera)

            if (mode === "shape") {
                if (!point) {
                    return
                }

                let width = roundToNearest(point.x - position[0], precision)
                let depth = roundToNearest(point.z - position[2], precision)

                setWidth(Math.abs(width))
                setDepth(Math.abs(depth))
                setOffset([width / 2, 0, depth / 2])
            } else if (mode === "height") {
                let height = roundToNearest((startY - e.clientY) * .025, precision)

                setHeight(Math.abs(height))
                setOffset([0, height / 2, 0])
            }
        }

        window.addEventListener("pointerdown", onpointerdown)
        window.addEventListener("pointermove", onpointermove)

        return () => {
            window.removeEventListener("pointerdown", onpointerdown)
            window.removeEventListener("pointermove", onpointermove)
        }
    }, [mode, camera, viewport, startY, position, offset])

    return {
        setWidth,
        setHeight,
        setDepth,
        setPosition,
        width,
        height,
        depth,
        mode,
        position: [
            position[0] + offset[0],
            position[1] + offset[1],
            position[2] + offset[2],
        ] as Tuple3
    }
}

interface EditorObjectProps {
    children?: ReactNode
    mode?: UseSizeCursorParams["mode"]
    position?: Tuple3
    size?: Tuple3
    offset?: Tuple3
    readOnlySize?: boolean
    id: string
}

export default function EditorObject({
    children,
    mode,
    position,
    size,
    offset,
    id,
    readOnlySize = false
}: EditorObjectProps) {
    let sizer = useEditorSizer({ mode, position, size })
    let activeObject = useEditorStore(i => i.activeObject)

    useEffect(() => {
        let onKeyDown = (e: KeyboardEvent) => {
            if (activeObject === id && ["Backspace", "Delete"].includes(e.code)) {
                removeObject(id)
            }
        }

        window.addEventListener("keydown", onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [activeObject])

    return (
        <context.Provider value={sizer}>
            {children}

            <group
                position={sizer.position}
                onPointerDown={() => {
                    setActiveObject(activeObject === id ? null : id)
                }}
            >
                <mesh position={offset} visible={activeObject === id}>
                    <boxGeometry args={[sizer.width, sizer.height, sizer.depth, 1, 1, 1]} />
                    <meshPhongMaterial color="yellow" wireframe />
                </mesh>

                {sizer.mode === "complete" && (
                    <Html
                        center
                        style={{
                            fontFamily: "monospace",
                            display: activeObject === id ? "flex" : "none",
                            flexDirection: "column",
                            gap: "1em",
                            padding: "1em .75em",
                            borderRadius: 4,
                            backgroundColor: "rgba(0 0 0 / .5)",
                            backdropFilter: "blur(.45em)"
                        }}
                    >
                        <VectorInput
                            legend="Position"
                            value={sizer.position}
                            onUpdate={(...params) => {
                                sizer.setPosition(params)
                            }}
                        />
                        <VectorInput
                            legend="Size"
                            readOnly={readOnlySize}
                            value={[sizer.width, sizer.height, sizer.depth]}
                            onUpdate={(x, y, z) => {
                                sizer.setWidth(x)
                                sizer.setHeight(y)
                                sizer.setDepth(z)
                            }}
                        />
                    </Html>
                )}
            </group>
        </context.Provider>
    )
}