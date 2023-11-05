import random from "@huth/random"
import { WorldPartBuildingsGap } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Plane from "../spawner/Plane"
import Turret from "../spawner/Turret"
import Floor from "../decoration/Floor"
import { WORLD_CENTER_X } from "../World"

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
            <Plane position={[3, 4, size[1]]} />
            <Plane position={[-3, 4, size[1] + 4]} />
            <Turret position={[0, 0, size[1] / 2]} />
        </WorldPartWrapper>
    )
} 