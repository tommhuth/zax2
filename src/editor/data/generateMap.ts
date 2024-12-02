import { EditorObject, EditorStore } from "./store"

function renderObject(name: string, object: EditorObject) {
    return `
            <${name}
                position={[${object.position.join(", ")}]}
            />
    `
}

function renderEdgeObject(type: string, object: EditorObject) {
    return `
            <EdgeElement
                type={"${type}"}
                x={${object.position[0]}}
                y={${object.position[1]}}
                z={${object.position[2]}}
                rotation={${object.rotation}}
                scale={[${object.scale.join(", ")}]}
            />
    `
}

function renderObstacle(type: string, object: EditorObject) {
    return `
            <Obstacle
                type={"${type}"}
                size={[${object.size.join(", ")}]} 
                position={[${object.size.join(", ")}]}  
            />
    `
}

function render(i: EditorObject) {
    switch (i.type) {
        case "barrel":
            return renderObject("Barrel", i)
        case "turret":
            return renderObject("Turret", i) 
        case "wall1":
        case "wall2":
        case "wall3":
        case "tower1":
        case "tower2":
        case "hangar":
            return renderEdgeObject(i.type, i)
        case "box":
        case "rockface":
        case "device":
            return renderObstacle(i.type, i)
        case "cable":
            return renderObject("Cable", i)
        case "plant":
            return renderObject("Plant", i)
        case "dirt":
            return renderObject("Dirt", i)
    }
}

export default function generateMap(store: EditorStore, name: string) {
    const template = ` 
import { WorldPart${name} } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Plane from "../spawner/Plane"
import EdgeElement from "../decoration/EdgeElement"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import Floor from "../decoration/Floor" 

export default function ${name}({
    id,
    position,
    size,
}: WorldPart${name}) {
    return (
        <WorldPartWrapper
            position={position}
            size={size}
            id={id}
        >
            ${store.objects.map(render).join("\n")}
            
            <Floor
                position={[position.x, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, .5 * random.pick(-1, 1)]}
                type="${store.floorType}"
            /> 
        </WorldPartWrapper>
    )
}  
    `

    return template
}