import { FLOOR_SIZE, WORLD_PLAYER_START_Z } from "@data/const"
import { Tuple2, Tuple3 } from "src/types.global"
import { EditorObject, EditorStore } from "./types"

function toTitleCase(str: string) {
    return str[0].toUpperCase() + str.substring(1)
}

function toFixed(value: number, precision: number): string {
    // thanks chattyman
    const fixed = value.toFixed(precision)

    return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed
} 
  
function editorToLocal(position: Tuple3) {
    return [
        position[0],
        position[1],
        position[2] - WORLD_PLAYER_START_Z
    ]
}

type ParamValue = Tuple3 | Tuple2 | number | string | null | boolean

function getParam(param: ParamValue) {
    if (Array.isArray(param)) {
        return "[" + param.join(", ") + "]"
    }

    if (typeof param === "number") {
        return toFixed(param, 3)
    }

    return JSON.stringify(param)
}

function renderObject(
    name: string,
    object: EditorObject,
    pickProps: (keyof EditorObject)[] = [],
    customProps: [key: string, value: ParamValue][] = [],
) {
    return `
            <${name}
                position={[${editorToLocal(object.position).join(", ")}]}
                ${pickProps.map(key => `${key}={${getParam(object[key])}}`).join("\n")} 
                ${customProps.map(([key, value]) => `${key}={${getParam(value)}}`).join("\n")}
            />`
}

function render(object: EditorObject) {
    switch (object.type) {
        case "barrel":
        case "rocket":
            return renderObject(toTitleCase(object.type), object)
        case "turret":
        case "plane":
            return renderObject(toTitleCase(object.type), object, ["rotation"])
        case "box":
        case "rockface":
        case "device":
            return renderObject("Obstacle", object, ["rotation", "size"], [["type", object.type]])
        case "wall1":
        case "wall2":
        case "wall3":
        case "tower1":
        case "tower2":
        case "hangar":
            return renderObject("EdgeElement", object, ["rotation", "scale"], [["type", object.type]])
        case "grass":
            return renderObject(toTitleCase(object.type), object, ["rotation"])
        case "cable":
        case "plant":
        case "dirt":
            return renderObject(toTitleCase(object.type), object, ["rotation"], [["scale", object.uniformScaler]])
    }
}

function pascalToKebabCase(value: string): string {
    return value
        .replace(/([A-Z])/g, "-$1") // Add dashes before each uppercase letter
        .toLowerCase() // Convert to lowercase
        .slice(1) // Remove the leading dash
}

function pascalToSnakeCase(value: string): string {
    return value
        .replace(/([A-Z])/g, "_$1") // Add underscores before each uppercase letter
        .toUpperCase() // Convert to uppercase
        .slice(1) // Remove the leading underscore
}

export default function generateMap(
    store: EditorStore,
    name: string
) {
    const template = ` 
import random from "@huth/random"
import { WorldPart } from "@data/types"
import WorldPartWrapper from "@components/world/WorldPartWrapper"
import Plane from "@components/world/spawner/Plane"
import Turret from "@components/world/spawner/Turret"
import Barrel from "@components/world/spawner/Barrel" 
import Rocket from "@components/world/spawner/Rocket" 
import Floor from "@components/world/decoration/Floor" 
import Plant from "@components/world/actors/Plant"
import Cable from "@components/world/decoration/Cable"
import Grass from "@components/world/decoration/Grass"
import Dirt from "@components/world/decoration/Dirt"
import Obstacle from "@components/world/decoration/Obstacle"
import EdgeElement from "@components/world/decoration/EdgeElement"
 
// ${pascalToSnakeCase(name)} = "${pascalToKebabCase(name)}", 

// depth
// [WorldPartType.${pascalToSnakeCase(name)}]: ${FLOOR_SIZE[store.floorType]},

// partGenerator
// [WorldPartType.${pascalToSnakeCase(name)}]: makeWorldPartGenerator(WorldPartType.${pascalToSnakeCase(name)}),

export default function ${name}({
    id,
    position,
    size,
}: WorldPart) {
    return (
        <WorldPartWrapper
            position={position}
            size={size}
            id={id}
        >
            <Floor
                position={[position.x, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="${store.floorType}"
            /> 
            ${store.objects.sort((a, b) => a.position[2] - b.position[2]).map(render).join("\n")} 
        </WorldPartWrapper>
    )
}`

    return template
}