import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Plane from "../spawner/Plane"
import Floor from "../decoration/Floor"
import Barrel from "../spawner/Barrel"
import Turret from "../spawner/Turret"
import Rocket from "../spawner/Rocket"
import { WORLD_TOP_EDGE } from "../../../data/const"
import Traffic from "../actors/Traffic"

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
            <EdgeBuilding type="hangar" z={16.5} x={8} />
            <EdgeBuilding type="tower2" z={10} x={7} /> 
            <EdgeBuilding type="wall1" z={11} x={9} />

            <Plane
                position={[2.25, .5, 40]}
                targetY={WORLD_TOP_EDGE}
            />
            <Plane
                position={[2.25, .5, 20]}
                targetY={WORLD_TOP_EDGE - 2}
            />
            <Plane
                position={[-4, WORLD_TOP_EDGE - 1, 40]}
            />
            <Turret
                position={[-2, 0, 35]}
                rotation={-Math.PI / 2}
                floorLevel={0}
            />
            <Barrel
                position={[4, 0, 6]}
            />
            <Barrel
                position={[5, 0, 20]}
            />
            <Barrel
                position={[-3, 0, 2]}
            />
            <Plane
                position={[-3, .5, 8]}
                rotation={.51}
                speed={0}
            />
            <Plane
                position={[-3, .5, 22]}
                rotation={-.91}
                speed={0}
            />
            <Barrel position={[5.5, 0, 32]} />
            <Rocket
                position={[-2, 0, 43]}
            />

            <Traffic
                z={position.z + 42}
            />

            <Floor
                type={"floor4"}
                position={[position.x, 0, size[1] / 2]}
            />
        </WorldPartWrapper>
    )
}