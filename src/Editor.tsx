import Camera from "@components/Camera";
import Canvas from "./Canvas";
import Models from "@components/world/models/Models";
import EdgeOverlay from "@components/EdgeOverlay";
import { WORLD_PLAYER_START_Z } from "@data/const";
import EditorObjects from "./editor/EditorObjects";
import { EditorObject } from "./editor/data/hooks";
import Dropzone from "./Dropzone";
import { Tuple3 } from "./types.global";

export type EditorObjectInit = {
    type: "barrel" | "obstacle"
    offset?: Tuple3
    readOnlySize?: boolean
} & Partial<EditorObject>

export default function Editor() {
    let objs: EditorObjectInit[] = [
        {
            type: "barrel",
            mode: "complete",
            readOnlySize: true,
            size: [2, 1.85, 2],
            offset: [0, 1.85 / 2, 0],
        },
        {
            type: "obstacle",
            mode: "shape",
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
            <Canvas>
                <Dropzone />
                <EditorObjects />
                <Camera editorMode />
                <Models />
                <EdgeOverlay ready />

                <mesh
                    position={[0, 0, WORLD_PLAYER_START_Z]}
                    rotation-x={-Math.PI * .5}
                >
                    <planeGeometry args={[50, 50, 25, 25]} />
                    <meshLambertMaterial color="darkgray" wireframe />
                </mesh>
            </Canvas>
        </>
    )
}