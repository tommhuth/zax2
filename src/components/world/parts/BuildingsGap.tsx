import WorldPartWrapper from "../WorldPartWrapper"
import TurretSpawner from "../spawner/Turret"
import Floor from "../actors/Floor"
import { WorldPart } from "@data/types"
import Dirt from "../actors/Dirt"
import Plant from "../actors/Plant"
import Obstacle from "../actors/Obstacle"
import Grass from "../actors/Grass"
import BarrelSpawner from "../spawner/Barrel"
import { memo } from "react"

function BuildingsGap({
    id,
    position,
    size,
    type
}: WorldPart) {
    return (
        <WorldPartWrapper
            position={position}
            size={size}
            id={id}
            type={type}
        >
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor2"
            />

            <Obstacle
                position={[2, 1, 0.5]}
                rotation={0}
                size={[4, 2, 0.5]}
                type={"box"}
            />

            <Obstacle
                position={[2, 1, 1.5]}
                rotation={0}
                size={[4, 2, 1]}
                type={"box"}
            />

            <Dirt
                position={[7.5, 0, 2]}
                rotation={0}
                scale={1.3}
            />

            <TurretSpawner
                position={[2, 1.5, 4.5]}
                rotation={4.712}
                floorLevel={2}
            />

            <TurretSpawner
                position={[2, 1.5, .5]}
                rotation={4.712 * 2}
                floorLevel={2}
            />

            <Obstacle
                position={[2, 1, 5.5]}
                rotation={0}
                size={[4, 2, 6]}
                type={"box"}
            />

            <Obstacle
                position={[2, 2, 7]}
                rotation={0}
                size={[3, 0.5, 2]}
                type={"device"}
            />

            <Grass
                position={[-5.5, 0, 8.5]}
                rotation={2.758}
            />

            <Grass
                position={[9, 0, 10]}
                rotation={0}
            />

            <Obstacle
                position={[2, 2.5, 11]}
                rotation={0}
                size={[4, 5, 4]}
                type={"box"}
            />

            <Obstacle
                position={[1, 1.5, 11]}
                rotation={0}
                size={[2.5, 3, 2.5]}
                type={"device"}
            />

            <Dirt
                position={[-0.5, 0, 16.5]}
                rotation={0}
                scale={1.8}
            />

            <Plant
                position={[3, 0, 17]}
                rotation={0}
                scale={1.3}
            />

            <BarrelSpawner
                position={[-1, 0, 17]}
            />
        </WorldPartWrapper>
    )
}


export default memo(BuildingsGap)