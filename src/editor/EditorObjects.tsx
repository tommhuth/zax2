import EditorObject from "./EditorObject"
import { useEditorStore } from "./data/store"
import BarellEditor from "./objects/Barrel.editor"
import ObstacleEditor from "./objects/Obstacle.editor"
import TurretEditor from "./objects/Turret.editor"
import RepeaterEditor from "./objects/Repeater.editor"
import { InstanceName, RepeaterName } from "@data/types"
import { instanceEditors, repeaterEditors } from "./data/utils"
import InstanceEditor from "./objects/Instance.editor"
import RocketEditor from "./objects/Rocket.editor"
import GrassEditor from "./objects/Grass.editor"
import PlaneEditor from "./objects/Plane.editor"

const defaultControls = ["rotation", "scale"] as const
const controls = {
    "barrel": [],
    "turret": ["rotation"],
    "rocket": [],
    "plane": ["rotation"],
    "device": ["rotation", "size"],
    "rockface": ["rotation", "size"],
    "empty": ["size"],
    "box": ["rotation", "size"],
    "grass": ["rotation"],
    "plant": ["scale", "rotation"],
} as const

export default function EditorObjects() {
    let objects = useEditorStore(i => i.objects)

    return objects.map((object) => {
        return (
            <EditorObject
                key={object.id}
                id={object.id}
                name={object.type}
                controls={controls[object.type] || defaultControls}
            >
                {object.type === "barrel" && (
                    <BarellEditor id={object.id} />
                )}
                {object.type === "turret" && (
                    <TurretEditor id={object.id} />
                )}
                {object.type === "rocket" && (
                    <RocketEditor id={object.id} />
                )}
                {object.type === "plane" && (
                    <PlaneEditor id={object.id} />
                )}
                {object.type === "device" && (
                    <ObstacleEditor type="device" id={object.id} />
                )}
                {object.type === "box" && (
                    <ObstacleEditor type="box" id={object.id} />
                )}
                {object.type === "rockface" && (
                    <ObstacleEditor type="rockface" id={object.id} />
                )}
                {object.type === "empty" && (
                    <ObstacleEditor type="empty" id={object.id} />
                )}
                {object.type === "grass" && (
                    <GrassEditor id={object.id} />
                )}
                {repeaterEditors.includes(object.type as any) && (
                    <RepeaterEditor type={object.type as RepeaterName} id={object.id} />
                )}
                {instanceEditors.includes(object.type as any) && (
                    <InstanceEditor type={object.type as InstanceName} id={object.id} />
                )}
            </EditorObject>
        )
    })
} 