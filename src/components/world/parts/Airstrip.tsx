import WorldPartWrapper from "../WorldPartWrapper"
import EdgeElement from "../actors/EdgeElement"
import PlaneSpawner from "../spawner/Plane"
import Floor from "../actors/Floor"
import BarrelSpawner from "../spawner/Barrel"
import { WorldPart } from "@data/types"
import Dirt from "../actors/Dirt"
import TurretSpawner from "../spawner/Turret"
import Plant from "../actors/Plant"
import Grass from "../actors/Grass"
import Obstacle from "../actors/Obstacle"
import { WORLD_TOP_EDGE } from "@data/const"
import { memo } from "react"

function Airstrip({
    id,
    position,
    size,
    type
}: WorldPart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
            type={type}
        >
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor4"
            />

            <Dirt
                position={[0.5, 0, 4]}
                rotation={0.524}
                scale={1.6}
            />

            <PlaneSpawner
                position={[-3.5, 0.5, 7]}
                rotation={2.409}
            />

            <Grass
                position={[8, 1, 7.5]}
                rotation={0.349}
            />

            <Obstacle
                position={[-1, 0, 14.5]}
                rotation={0}
                size={[1, 0.5, 1]}
                type={"box"}
            />

            <PlaneSpawner
                position={[5.5, 0.5, 16.5]}
                rotation={0.942}
            />

            <Obstacle
                position={[-1, 0.25, 17.5]}
                rotation={0}
                size={[1, 0.5, 4]}
                type={"box"}
            />

            <Dirt
                position={[10.5, 0, 18.5]}
                rotation={1.292}
                scale={1.3}
            />

            <PlaneSpawner
                position={[2, 0.5, 26]}
                rotation={0}
            />

            <PlaneSpawner
                position={[2, WORLD_TOP_EDGE, 36]}
                rotation={0}
            />

            <EdgeElement
                position={[8, 0, 25]}
                rotation={3.142}
                type={"hangar"}
                scale={[1.1, 1.1, 1.1]}
            />

            <Dirt
                position={[-1.5, 0, 25]}
                rotation={0}
                scale={1.9}
            />

            <Plant
                position={[-1, 0, 27]}
                rotation={1.728}
                scale={0.7}
            />

            <Obstacle
                position={[-1, 0.5, 29.5]}
                rotation={0}
                size={[1, 2, 1]}
                type={"box"}
            />

            <EdgeElement
                position={[11, 0, 30]}
                rotation={3.142}
                type={"wall2"}
                scale={[1.4, 1.4, 1.4]}
            />

            <BarrelSpawner
                position={[7, 0, 31]}
            />

            <Obstacle
                position={[-1, -1, 33]}
                rotation={0}
                size={[1, 5, 5.5]}
                type={"box"}
            />

            <EdgeElement
                position={[5.5, 0, 34]}
                rotation={3.142}
                type={"tower1"}
                scale={[1, 1, 1]}
            />

            <Grass
                position={[-5.5, 1, 39]}
                rotation={0.611}
            />

            <Plant
                position={[8.5, 0, 41.5]}
                rotation={0}
                scale={1}
            />

            <Dirt
                position={[-4, 0, 42.5]}
                rotation={1.466}
                scale={1.3}
            />

            <Dirt
                position={[7.5, 0, 44]}
                rotation={0.419}
                scale={1.6}
            />

            <TurretSpawner
                position={[7, 0, 44.5]}
                rotation={3.142}
                floorLevel={0}
            />
        </WorldPartWrapper>
    )
}


export default memo(Airstrip)