
import random from "@huth/random"
import { WorldPart } from "@data/types"
import WorldPartWrapper from "@components/world/WorldPartWrapper"
import Floor from "@components/world/decoration/Floor"
import Plant from "@components/world/actors/Plant"
import Grass from "@components/world/decoration/Grass"
import Obstacle from "@components/world/decoration/Obstacle"
import TurretSpawner from "../spawner/Turret"
import Dirt from "../decoration/Dirt"

export default function RockValley({
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
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="floor2"
            />

            <Plant
                position={[-3.5, 0, 1.5]}
                rotation={0}
                scale={1}
            />

            <Grass
                position={[2, 0, 5.5]}
                rotation={5.829} 
            />

            <Plant
                position={[7, 2.5, 6.5]}
                rotation={0}
                scale={1}
            />

            <Dirt
                position={[-3, 0, 6.5]}
                rotation={0}
                scale={1.5}
            />

            <Obstacle
                position={[8, 1, 8.5]}
                rotation={0}
                size={[6, 3, 7.5]}
                type={"rockface"}
            />

            <Obstacle
                position={[4.5, 1.5, 12]}
                rotation={6.109}
                size={[3, 6.5, 3]}
                type={"rockface"}
            />

            <Obstacle
                position={[-4.5, 3, 12.5]}
                rotation={0.14}
                size={[2, 11.5, 2.5]}
                type={"rockface"}
            />

            <TurretSpawner
                position={[0.5, 1, 14.5]}
                rotation={4.712}
                floorLevel={2}
            />

            <Obstacle
                position={[-1.5, 1, 16]}
                rotation={0}
                size={[9, 2, 6.5]}
                type={"rockface"}
            />

            <Plant
                position={[8.5, 0, 17]}
                rotation={0}
                scale={1}
            />
        </WorldPartWrapper>
    )
}