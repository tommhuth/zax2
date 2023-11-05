import { WorldPartBuildingsLow } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import Plane from "../spawner/Plane"
import Building from "../spawner/Building"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../World"
import { useRepeater } from "../../RepeaterMesh"
import { useEffect } from "react"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Grass from "../decoration/Grass"
import Plant from "../decoration/Plant"

export default function BuildingsLow({
    id,
    position,
    size,
}: WorldPartBuildingsLow) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Floor
                position={[position.x + WORLD_CENTER_X, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="floor3"
            />
            <Barrel
                position={[WORLD_CENTER_X - 3, 0, 7]}
            />

            <Building
                position={[WORLD_CENTER_X, 0, size[1] - 2]}
                size={[3, 1, 3]}
            />
            <Turret position={[WORLD_CENTER_X, 1, size[1] - 2]} />
            <Turret position={[WORLD_CENTER_X + 3, 0, 2]} />

            <Grass
                position={[WORLD_RIGHT_EDGE + 6, 0, size[1] / 2]}
            />
            <Grass
                position={[WORLD_LEFT_EDGE - 5, 0, size[1] / 2]}
            />
            
            <Plant
                position={[WORLD_RIGHT_EDGE + 4, 0, size[1]]}
                scale={[1, 1, 1]}
            />
            <Plant
                position={[WORLD_LEFT_EDGE - 4, 0, 0]}
                scale={[1.5, 1.5, 1.5]}
            />
        </WorldPartWrapper>
    )
}