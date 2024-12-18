import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Grass from "../decoration/Grass"
import Plant from "../actors/Plant"

export default function BuildingsLow({
    id,
    position,
    size,
}: WorldPart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Plant
                position={[5, 0, 2]}
                scale={1.35}
            />

            <Turret
                position={[-3, 0, 2]}
                floorLevel={0}
            />
            <Turret
                position={[5, -.5, 10]}
                rotation={-Math.PI / 2}
                floorLevel={0}
            />

            <Barrel
                position={[4, 0, 16]}
            />

            <Grass
                position={[-8, 0, size[1] / 2 - 2]}
            />
            <Turret
                position={[0, 2, size[1] - 2]}
                rotation={-Math.PI / 2}
                floorLevel={0}
            />

            <Plant
                position={[-1, 0, 6]}
                scale={1}
            />

            <Plant
                position={[7, 0, 11]}
                scale={1}
            />
            <Floor
                position={[position.x, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="floor2"
            />
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor2"
            />
        </WorldPartWrapper>
    )
}