import { WorldPart } from "@data/types"
import WorldPartWrapper from "@components/world/WorldPartWrapper"
import Floor from "@components/world/decoration/Floor"
import Grass from "@components/world/decoration/Grass"

export default function GrassPart({
    id,
    position,
    size,
}: WorldPart) {
    return (
        <WorldPartWrapper
            position={position}
            size={size}
            id={id}
        >
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor4"
            />

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