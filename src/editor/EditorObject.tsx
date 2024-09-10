import { Html } from "@react-three/drei"
import { ReactNode, useEffect, Suspense } from "react"
import VectorInput from "./VectorInput"
import { removeObject, setActiveObject, updateObject } from "./data/actions"
import { EditorObject as EditorObjectType, useEditorStore } from "./data/store"

interface EditorObjectProps {
    children?: ReactNode
    id: string
}

export default function EditorObject({
    children,
    id,
}: EditorObjectProps) {
    let activeObject = useEditorStore(i => i.activeObject)
    let object = useEditorStore(i => i.objects.find(i => i.id === id)) as EditorObjectType

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
        < >
            <Suspense>
                {children}
            </Suspense>

            <group
                position={object.position}
                onPointerDown={() => {
                    setActiveObject(activeObject === id ? null : id)
                }}
            >
                <mesh position={object.anchor} visible={activeObject === id || object.invisible}>
                    <boxGeometry args={[...object.size, 1, 1, 1]} />
                    <meshPhongMaterial color="yellow" wireframe />
                </mesh>

                {object.mode === "complete" && (
                    <Html
                        center
                        style={{
                            fontFamily: "monospace",
                            display: activeObject === id ? "flex" : "none",
                            flexDirection: "column",
                            gap: "1em",
                            padding: "1em .75em",
                            borderRadius: 4,
                            backgroundColor: "rgba(0 0 0 / .2)",
                            backdropFilter: "blur(.45em)"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: ".75em",
                            }}
                        >
                            <label
                                style={{ display: "flex", justifyContent: "space-between" }}
                            >
                                <span style={{ opacity: .5, }}>
                                    Rotation
                                </span>
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
                                step={360 * .125 * .5}
                            />
                        </div>
                        <VectorInput
                            legend="Position"
                            value={object.position}
                            onUpdate={(...params) => {
                                updateObject(id, { position: params })
                            }}
                        />
                        <VectorInput
                            legend="Size"
                            readOnly={object.ridgid}
                            value={object.size}
                            onUpdate={(...params) => {
                                updateObject(id, { size: params })
                            }}
                        />
                    </Html>
                )}
            </group>
        </>
    )
}