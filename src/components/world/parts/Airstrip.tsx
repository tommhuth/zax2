import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Plane from "../spawner/Plane"
import { WORLD_CENTER_X, WORLD_LEFT_EDGE, WORLD_RIGHT_EDGE, WORLD_TOP_EDGE } from "../World"
import Floor from "../decoration/Floor"
import Barrel from "../spawner/Barrel"
import Turret from "../spawner/Turret"

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
            <EdgeBuilding type="hangar" z={17.85} x={WORLD_LEFT_EDGE + 3} />
            <Plane
                position={[WORLD_CENTER_X + 2.25, .5, 40]}
                targetY={WORLD_TOP_EDGE}
            />
            <Plane
                position={[WORLD_CENTER_X + 2.25, .5, 20]}
                targetY={WORLD_TOP_EDGE - 2}
            />
            <Plane
                position={[-4, WORLD_TOP_EDGE - 2, 30]}
            /> 
            <Turret
                position={[-2, 0, 6]}
                rotation={-Math.PI/2}
            />
            <Turret
                position={[-2, 1, 35]}
                rotation={-Math.PI/2}
            />
            <Turret
                position={[4, 0, 45]}
                rotation={-Math.PI/2}
            />
            <Barrel 
                position={[2,0,2]}
            />
            <Barrel 
                position={[-2,0,14]}
            />
            <Barrel 
                position={[-2,0,43]}
            />
        </WorldPartWrapper>
    )
}