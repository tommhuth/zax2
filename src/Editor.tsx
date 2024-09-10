import Camera from "@components/Camera";
import Canvas from "./Canvas";
import Models from "@components/world/models/Models";
import EdgeOverlay from "@components/EdgeOverlay";
import { WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "@data/const";
import EditorObjects from "./editor/EditorObjects";
import Dropzone from "./editor/Dropzone"; 
import Floor from "@components/world/decoration/Floor";
import { Suspense, useState } from "react"; 
import { setActiveObject } from "./editor/data/actions";
import { EditorObjectInit } from "./editor/data/store";

const floorSize = {
    floor1: 20,
    floor2: 20,
    floor3: 20,
    floor4: 48,
}

export default function Editor() {
    let [floorType, setFloorType] = useState<"floor1" | "floor2" | "floor3" | "floor4">("floor1")
    let [z, setZ] = useState(0)
    let [gridVisible, setGridVisible] = useState(false)
    let objs: EditorObjectInit[] = [
        {
            type: "barrel",
            size: [2, 1.85, 2],
            anchor: [0, 1.85 / 2, 0],
        },
        {
            type: "turret",
            size: [1.85, 4.5, 1.85],
        },
        {
            type: "obstacle",
            mode: "shape",
            ridgid: false,
        }
    ]
    return (
        <>
            <menu
                style={{
                    zIndex: 10000,
                    position: "fixed",
                    left: 16,
                    top: 16,
                    bottom: 16,
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                {objs.map(i => {
                    return (
                        <li
                            key={i.type}
                            style={{
                                padding: "1em",
                                textAlign: "center",
                                backgroundColor: "red"
                            }}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.dropEffect = "move";
                                e.dataTransfer.setData("application/json", JSON.stringify(i))
                            }}
                        >
                            {i.type}
                        </li>
                    )
                })}
            </menu>
            <div
                style={{
                    position: "fixed",
                    bottom: 16,
                    right: 16,
                    zIndex: 10000,
                    display: "flex",
                    padding: ".5em",
                    borderRadius: 4,
                    backgroundColor: "rgba(0 0 0 / .5)",
                    placeContent: "center",
                    gap: 16
                }}
            >
                <label
                    style={{
                        display: "flex",
                        placeContent: "center",
                        gap: ".5em"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={gridVisible}
                        onChange={(e) => setGridVisible(e.currentTarget.checked)}
                    />
                    Grid
                </label>
                <select
                    onChange={e => setFloorType(e.currentTarget.value as typeof floorType)}
                    value={floorType}
                >
                    {Array.from({ length: 4 }).fill(null).map((i, index) => {
                        return (
                            <option key={index} value={"floor" + (index + 1)}>
                                floor{index + 1}
                            </option>
                        )
                    })}
                </select>
                <input
                    type="range"
                    style={{ width: 300 }}
                    step={.5}
                    min={-35}
                    max={35}
                    value={z}
                    onChange={(e) => setZ(e.currentTarget.valueAsNumber)}
                />

            </div>
            <Canvas
                onPointerMissed={() => {
                    setActiveObject(null)
                }}
            >
                <Dropzone />
                <EditorObjects />
                <Camera editorMode z={z} />
                <Models />
                <EdgeOverlay ready />

                <Suspense>
                    <Floor
                        key={floorType}
                        position={[WORLD_CENTER_X, 0, WORLD_PLAYER_START_Z + floorSize[floorType] / 2]}
                        type={floorType}
                    />
                </Suspense>


                <mesh
                    position={[0, 0, WORLD_PLAYER_START_Z]}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshLambertMaterial color="red" />
                </mesh>

                <mesh
                    position={[0, 0, WORLD_PLAYER_START_Z]}
                    rotation-x={-Math.PI * .5}
                    visible={gridVisible}
                >
                    <planeGeometry args={[100, 100, 50, 50]} />
                    <meshLambertMaterial color="black" wireframe transparent opacity={.2} />
                </mesh>
            </Canvas>
        </>
    )
}