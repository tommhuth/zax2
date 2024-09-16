 
import EditorObject from "./EditorObject"
import { useEditorStore } from "./data/store"
import BarellEditor from "./objects/Barrel.editor"
import ObstacleEditor from "./objects/Obstacle.editor"
import TurretEditor from "./objects/Turret.editor"
import RepaterEditor from "./objects/Repeater.editor"
import { InstanceName, RepeaterName } from "@data/types"
import { instanceEditors, repeaterEditors } from "./data/utils"
import InstanceEditor from "./objects/Instance.editor"

export default function EditorObjects() {
    let objects = useEditorStore(i => i.objects)

    return (
        <>
            {objects.map((i) => {
                return (
                    <EditorObject key={i.id} id={i.id} name={i.type}>
                        {i.type === "barrel" && (
                            <BarellEditor id={i.id}  />
                        )} 
                        {i.type === "device" && (
                            <ObstacleEditor type="device" id={i.id} />
                        )}
                        {i.type === "box" && (
                            <ObstacleEditor type="box" id={i.id} />
                        )}
                        {i.type === "rockface" && (
                            <ObstacleEditor type="rockface" id={i.id} />
                        )}
                        {i.type === "turret" && (
                            <TurretEditor id={i.id} />
                        )}
                        {repeaterEditors.includes(i.type as any) && (
                            <RepaterEditor type={i.type as RepeaterName} id={i.id} />
                        )}
                        {instanceEditors.includes(i.type as any) && (
                            <InstanceEditor type={i.type as InstanceName} id={i.id} />
                        )}
                    </EditorObject>
                )
            })}
        </>
    )
} 