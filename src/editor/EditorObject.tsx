import { Html } from "@react-three/drei"
import { ReactNode, useEffect, Suspense } from "react"
import VectorInput from "./ui/VectorInput"
import { removeObject, setActiveObject, updateObject } from "./data/actions"
import { EditorObject as EditorObjectType } from "./data/types"
import { useEditorStore } from "./data/store"

interface EditorObjectProps {
    children?: ReactNode
    id: string
    name: string
    controls: string[]
}

export default function EditorObject({
    children,
    controls = [],
    id,
    name,
}: EditorObjectProps) {
    let activeObjectId = useEditorStore(i => i.activeObjectId)
    let object = useEditorStore(i => i.objects.find(i => i.id === id)) as EditorObjectType

    useEffect(() => {
        let onKeyDown = (e: KeyboardEvent) => {
            if (activeObjectId === id && ["Backspace", "Delete"].includes(e.code)) {
                removeObject(id)
            }
        }

        window.addEventListener("keydown", onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [activeObjectId, id])

    return (
        <>
            <Suspense>
                {children}
            </Suspense>

            <group
                position={object.position}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    setActiveObject(activeObjectId === id ? null : id)
                }}
            >
                <group
                    rotation-y={object.rotation}
                >
                    <mesh
                        visible={activeObjectId === id || object.invisible || ["height", "shape"].includes(object.mode)}
                        position-x={object.anchor[0] + (object.mode === "shape" ? object.size[0] / 2 : 0)}
                        position-y={object.anchor[1] + (object.mode === "height" ? object.size[1] / 2 : 0)}
                        position-z={object.anchor[2] + (object.mode === "shape" ? object.size[2] / 2 : 0)}
                    >
                        <boxGeometry args={[...object.size, 1, 1, 1]} />
                        <meshPhongMaterial
                            wireframe
                            color={activeObjectId === id ? "yellow" : "purple"}
                        />
                    </mesh>
                </group>

                {object.mode === "complete" && (
                    <Html
                        center
                        style={{
                            display: activeObjectId === id ? "flex" : "none",
                        }}
                        className="editor-object"
                    >
                        <fieldset
                            className="editor-object__fieldset"
                        >
                            <legend
                                className="editor-object__legend"
                            >
                                {name}
                            </legend>

                            <div
                                className="editor-object__slider"
                                style={{
                                    display: controls.includes("rotation") ? "flex" : "none",
                                }}
                            >
                                <label
                                    className="editor-object__slider-label"
                                >
                                    <strong>
                                        Rotation
                                    </strong>
                                    {(object.rotation * (180 / Math.PI)).toFixed(1)}&deg;
                                </label>
                                <input
                                    onChange={(e) => {
                                        updateObject(id, {
                                            rotation: e.currentTarget.valueAsNumber * (Math.PI / 180)
                                        })
                                    }}
                                    value={object.rotation * (180 / Math.PI)}
                                    type="range"
                                    min={0}
                                    max={360}
                                    step={1}
                                />
                            </div>

                            <VectorInput
                                legend="Position"
                                value={object.position}
                                onUpdate={(...params) => {
                                    updateObject(id, { position: params })
                                }}
                            />

                            {controls.includes("size") && (
                                <VectorInput
                                    legend="Size"
                                    value={object.size}
                                    onUpdate={(...params) => {
                                        updateObject(id, { size: params })
                                    }}
                                />
                            )}

                            {controls.includes("scale") && (
                                <div
                                    className="editor-object__slider"
                                >
                                    <label
                                        className="editor-object__slider-label"
                                    >
                                        <strong>
                                            Scale
                                        </strong>
                                        {Math.floor(object.uniformScaler * 100)}%
                                    </label>
                                    <input
                                        onChange={(e) => {
                                            updateObject(id, {
                                                uniformScaler: e.currentTarget.valueAsNumber
                                            })
                                        }}
                                        value={object.uniformScaler || 1}
                                        type="range"
                                        min={.2}
                                        max={3}
                                        step={.1}
                                    />
                                </div>
                            )}
                        </fieldset>
                    </Html>
                )}
            </group>
        </>
    )
}