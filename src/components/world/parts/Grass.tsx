import { WorldPart } from "@data/types"
import WorldPartWrapper from "@components/world/WorldPartWrapper"
import Floor from "@components/world/actors/Floor"
import Grass from "@components/world/actors/Grass"
import RocketSpawner from "../spawner/Rocket"
import { memo } from "react"

function GrassPart({
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
                type="floor4"
            />

            <RocketSpawner position={[-1, 0, 1]} />

            <Grass
                position={[0, 0, 7.5]}
                rotation={0}
            />

            <Grass
                position={[-0.5, 0, 23]}
                rotation={3.054}
            />

            <Grass
                position={[3, 0, 39.5]}
                rotation={0.873}
            />
        </WorldPartWrapper>
    )
}

export default memo(GrassPart)