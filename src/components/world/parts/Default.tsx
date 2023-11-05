import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Rocket from "../spawner/Rocket"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../World"
import { useState } from "react"
import random from "@huth/random"
import makeCycler from "../../../data/cycler"
import Floor from "../decoration/Floor"
import Plant from "../decoration/Plant"


let t = makeCycler(["floor1", "floor2"], .35)

export default function Default({
    id,
    position,
    size,
}: WorldPartDefault) {
    let [floort] = useState(() => t.next())

    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Floor
                type={"floor1"}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                position={[position.x + WORLD_CENTER_X, 0, size[1] / 2]}
            />

            <EdgeBuilding z={size[1] / 2} />
            <Turret
                position={[WORLD_CENTER_X + 3, 0, 4]}
            />
            <Turret
                position={[WORLD_CENTER_X + 3, 0, 10]}
            />
            <Building
                position={[WORLD_CENTER_X, 0, 2]}
                size={[3, 1, 3]}
            />
            <Rocket
                position={[WORLD_CENTER_X, -2, 6]}
            />
            <Barrel
                position={[WORLD_CENTER_X - 3, 0, 7]}
            />
            <Barrel
                position={[WORLD_LEFT_EDGE + 3, 0, 16]}
            />
        </WorldPartWrapper>
    )
}

// 