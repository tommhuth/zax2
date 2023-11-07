import { WorldPartDefault, WorldPartStart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Rocket from "../spawner/Rocket"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../World"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import { AsteroidStart } from "../decoration/AsteroidStart"

export default function Start({
    id,
    position,
    size,
}: WorldPartStart) {  
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <AsteroidStart position={[0,0,0]} />

            <Building
                position={[WORLD_CENTER_X + 6, 0, -2]}
                size={[3, 3, 3]}
            />
            <Turret
                position={[WORLD_CENTER_X + 6, 3, -2]}
                rotation={Math.PI}
            />

            <Turret
                position={[WORLD_CENTER_X - 2, 1, 2]}
                rotation={-Math.PI / 2}
            />
            <Building
                position={[WORLD_CENTER_X - 2, 0, 2]}
                size={[3, 1, 3]}
            />
            <Barrel
                position={[WORLD_CENTER_X - 2, 0, 7]}
            />
            <Barrel
                position={[WORLD_CENTER_X + 3, 0, -2]}
            />
            <Rocket
                position={[WORLD_RIGHT_EDGE, 0, 10]}
            />
            <Rocket
                position={[WORLD_RIGHT_EDGE, 0, 15]}
            />
            <Barrel
                position={[WORLD_LEFT_EDGE, 0, 17]}
            />
            <Barrel
                position={[WORLD_LEFT_EDGE + 3, 0, 15]}
            />

            <Turret
                position={[WORLD_CENTER_X - 2, 0, 11]}
            />

            <Floor
                type={"floor1"}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                position={[position.x + WORLD_CENTER_X, 0, size[1] / 2]}
            />

            <EdgeBuilding z={size[1] / 2} />
        </WorldPartWrapper>
    )
}

// 