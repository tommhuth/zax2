import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Plane from "../spawner/Plane"
import { WORLD_TOP_EDGE } from "../World"
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
            <EdgeBuilding type="hangar" z={17.85} x={-2} />
            <Plane
                position={[2.25, .5, 40]}
                targetY={WORLD_TOP_EDGE}
            />
            <Plane
                position={[ 2.25, .5, 30]}
                targetY={WORLD_TOP_EDGE - 2}
            />
            <Plane
                position={[-4, WORLD_TOP_EDGE - 1, 40]}
            /> 
            <Turret
                position={[4, 0, 6]}
                rotation={-Math.PI/2}
            />
            <Turret
                position={[-2, 1, 35]}
                rotation={-Math.PI/2}
            />
            <Turret
                position={[5, 0, 45]}
                rotation={-Math.PI/2}
            />
            <Barrel 
                position={[5,0,10]}
            />
            <Barrel 
                position={[5,0,20]}
            />
            <Barrel 
                position={[-3,0,3]}
            />
            <Turret 
                position={[-1,1,14]}
                rotation={-Math.PI/2}
            />
            <Barrel 
                position={[-2,0,43]}
            />
            <Barrel 
                position={[5.5,0,32]}
            />
            <Barrel 
                position={[-1.5,0,28]}
            />
            <Floor
                type={"floor4"}
                position={[position.x  , 0, size[1] / 2]}
            />
        </WorldPartWrapper>
    )
}