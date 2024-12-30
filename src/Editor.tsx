import Camera from "@components/Camera"
import Canvas from "./Canvas"
import SharedModels from "@components/world/models/SharedModels"
import EdgeOverlay from "@components/EdgeOverlay"
import { FLOOR_SIZE, WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "@data/const"
import EditorObjects from "./editor/EditorObjects"
import Dropzone from "./editor/Dropzone"
import Floor from "@components/world/actors/Floor"
import { Suspense } from "react"
import { setActiveObject } from "./editor/data/actions"
import { useEditorStore } from "./editor/data/store"
import Toolbar from "./editor/Toolbar"

export default function Editor() {
    let floorType = useEditorStore(i => i.floorType)
    let gridVisible = useEditorStore(i => i.gridVisible)
    let axesVisible = useEditorStore(i => i.axesVisible)
    let worldCenterVisible = useEditorStore(i => i.worldCenterVisible)
    let [, , z] = useEditorStore(i => i.cameraPosition)

    return (
        <>
            <Toolbar />
            <Canvas
                onPointerMissed={() => {
                    setActiveObject(null)
                }}
            >
                <Dropzone />
                <EditorObjects />
                <Camera editorMode z={z} />
                <SharedModels />
                <EdgeOverlay ready />

                <Suspense>
                    <Floor
                        key={floorType}
                        position={[WORLD_CENTER_X, 0, WORLD_PLAYER_START_Z + FLOOR_SIZE[floorType] / 2]}
                        type={floorType}
                    />
                </Suspense>

                <mesh
                    position={[0, 0, WORLD_PLAYER_START_Z]}
                    visible={worldCenterVisible}
                >
                    <sphereGeometry args={[.25, 16, 16]} />
                    <meshLambertMaterial color="red" />
                </mesh>

                <axesHelper
                    position={[0, 0, WORLD_PLAYER_START_Z + z]}
                    scale={6}
                    visible={axesVisible}
                />

                <mesh
                    position={[0, 0, WORLD_PLAYER_START_Z]}
                    rotation-x={-Math.PI * .5}
                    visible={gridVisible}
                >
                    <planeGeometry args={[100, 100, 50, 50]} />
                    <meshLambertMaterial color="white" wireframe transparent opacity={.5} />
                </mesh>
            </Canvas>
        </>
    )
}