import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Plane from "../spawner/Plane"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "../World"
import Floor from "../decoration/Floor"
import Barrel from "../spawner/Barrel"

export default function Airstrip({
    id,
    position,
    size,
}: WorldPartAirstrip) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Floor
                type={"floor4"}
                position={[position.x + WORLD_CENTER_X, 0, size[1] / 2]}
            />
            <EdgeBuilding type="hangar" z={17.85} x={WORLD_LEFT_EDGE + 4} />
            <Plane
                position={[0, .5, size[1]]}
                targetY={WORLD_TOP_EDGE}
            />
            <Plane
                position={[0, .5, size[1] + 10]}
                targetY={WORLD_TOP_EDGE - 2}
            />
            <Plane
                position={[-4, WORLD_TOP_EDGE - 1, size[1]]}
            />
        </WorldPartWrapper>
    )
}