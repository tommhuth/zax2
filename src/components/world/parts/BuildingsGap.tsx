import random from "@huth/random"
import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Plane from "../spawner/Plane"
import Turret from "../spawner/Turret"
import Floor from "../decoration/Floor"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE } from "../World"
import Building from "../spawner/Building"

export default function BuildingsGap({
    id,
    position,
    size,
}: WorldPartBuildingsGap) {
    return (
        <WorldPartWrapper
            position={position}
            size={size}
            id={id}
        >
            <Floor
                position={[position.x + WORLD_CENTER_X, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, .5 * random.pick(-1, 1)]}
                type="floor3"
            />
            <Plane position={[3, 5, 10]} />
            <Plane position={[-3, 4, 15]} />
            <Turret
                position={[WORLD_RIGHT_EDGE + 2, 1, 7]}
                rotation={random.pick(0, -Math.PI  )}
            />
            <Turret
                position={[WORLD_LEFT_EDGE + 3, 0, 4]}
                rotation={random.pick(0, -Math.PI / 2)}
            />
 
        </WorldPartWrapper>
    )
} 