import Camera from "@components/Camera"
import Canvas from "./Canvas"
import Models from "@components/world/models/Models"
import EdgeOverlay from "@components/EdgeOverlay"
import { WORLD_CENTER_X, WORLD_PLAYER_START_Z } from "@data/const"
import EditorObjects from "./editor/EditorObjects"
import Dropzone from "./editor/Dropzone"
import Floor from "@components/world/decoration/Floor"
import { Suspense } from "react"
import { setActiveObject } from "./editor/data/actions"
import { useEditorStore } from "./editor/data/store"
import Toolbar from "./editor/Toolbar"

const floorSize = {
    floor1: 20,
    floor2: 20,
    floor3: 20,
    floor4: 48,
}

export default function Editor() {
    let floorType = useEditorStore(i => i.floorType)
    let gridVisible = useEditorStore(i => i.gridVisible)
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
                    <sphereGeometry args={[.25, 16, 16]} />
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