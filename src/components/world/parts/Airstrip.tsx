import { WorldPartAirstrip } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeElement from "../decoration/EdgeElement"
import Plane from "../spawner/Plane"
import Floor from "../decoration/Floor"
import Barrel from "../spawner/Barrel"
import Turret from "../spawner/Turret"
import Rocket from "../spawner/Rocket"
import { WORLD_TOP_EDGE } from "../../../data/const" 
import Wall1 from "../models/repeaters/Wall1"
import Cable from "../decoration/Cable"
import Obstacle from "../decoration/Obstacle"

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
                position={[position.x, 0, size[1] / 2]}
            />
            <EdgeElement type="hangar" z={16.5} x={8} />
            <EdgeElement type="tower2" z={7.5} x={7} />
            <EdgeElement type="tower2" z={10} x={7} />
            <EdgeElement type="wall1" z={9} x={9} scale={[1, 1, 1.25]} />
            <EdgeElement type="hangar" z={25.25} x={8} />
            <EdgeElement type="wall1" z={26} x={9} scale={[1, 1, 2.5]} />

            <Barrel position={[6, 0, 3]} /> 

            <Obstacle
                type="device"
                position={[5.5, 0, 20.5]}
                size={[2, .5, 2]}
            />
            <Obstacle
                type="device"
                position={[-1, 0, 14.5]}
                size={[2, 1.5, 3]}
            />
            <Turret
                position={[-1, .5, 16]}
                floorLevel={0}
                rotation={Math.PI * -.5}
            />

            <Plane
                position={[-4, .5, 8.5]}
                rotation={2}
                speed={0}
            />
            <Plane
                position={[-4, .5, 18]}
                rotation={0}
                speed={0}
            />

            <Obstacle
                type="device"
                position={[5.5, 0, 30]}
                size={[2, .5, 3]}
            />
            <Rocket position={[5.5, 0, 32]} />

            <Plane
                position={[2, .5, 23]}
                targetY={WORLD_TOP_EDGE}
            />

            <Barrel
                position={[-1, 0, 32]}
            />
            <Barrel
                position={[0, 0, 36]}
            />

            <Plane
                position={[2, .5, 39]}
                targetY={WORLD_TOP_EDGE}
            />

            <Barrel
                position={[5, 0, 45]}
            />

            <Rocket position={[-4, 0, 42]} />

            <Wall1
                position={[7, 0, position.z + 45]}
                scale={[1, 1, .7]}
                rotation={[0, Math.PI, 0]}
            />

            <Cable
                position={[8, 0, 39]}
                rotation={2}
            />
        </WorldPartWrapper>
    )
}