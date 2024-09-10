 import EditorObject from "./EditorObject"
import { useEditorStore } from "./data/store"
import BarellEditor from "./objects/Barrel.editor"
import ObstacleEditor from "./objects/Obstacle.editor"
import TurretEditor from "./objects/Turret.editor"

export default function EditorObjects() {
    let objects = useEditorStore(i => i.objects)

    return (
        <>
            {objects.map((i) => {
                return (
                    <EditorObject key={i.id} id={i.id}>
                        {i.type === "barrel" && (
                            <BarellEditor id={i.id} />
                        )} 
                        {i.type === "obstacle" && (
                            <ObstacleEditor id={i.id} />
                        )}
                        {i.type === "turret" && (
                            <TurretEditor id={i.id} />
                        )}
                    </EditorObject>
                )
            })}
        </>
    )
} 