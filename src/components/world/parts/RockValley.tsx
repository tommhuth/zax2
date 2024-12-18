
import random from "@huth/random"
import { WorldPart } from "@data/types"
import WorldPartWrapper from "@components/world/WorldPartWrapper"
import Turret from "@components/world/spawner/Turret"
import Barrel from "@components/world/spawner/Barrel"
import Floor from "@components/world/decoration/Floor"
import Plant from "@components/world/actors/Plant"
import Grass from "@components/world/decoration/Grass"
import Obstacle from "@components/world/decoration/Obstacle"
import EdgeElement from "@components/world/decoration/EdgeElement"
 
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
                type="floor3"
            />

            <EdgeElement
                position={[6.5, 0, 2]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"tower1"}
            />

            <Plant
                position={[1.5, 0, 2.5]}
                rotation={0.000}

            />

            <Barrel
                position={[4.5, 0, 2.5]}


            />

            <Grass
                position={[-4, 0, 6]}
                rotation={0.785}

            />

            <Plant
                position={[2.5, 1.5, 6.5]}
                rotation={2.749}

            />

            <Obstacle
                position={[3.5, 0.5, 7.5]}
                rotation={0.000}
                size={[4.5, 1.5, 3.5]}
                type={"rockface"}
            />

            <Grass
                position={[11.5, 0, 9]}
                rotation={0.393}

            />

            <Obstacle
                position={[6.5, 1, 10.5]}
                rotation={0.000}
                size={[3.5, 5.5, 4.5]}
                type={"rockface"}
            />

            <Obstacle
                position={[1, 4, 11]}
                rotation={0.393}
                size={[3, 8, 3]}
                type={"rockface"}
            />

            <Barrel
                position={[-3.5, 0, 11.5]}


            />

            <Obstacle
                position={[2, 1, 13.5]}
                rotation={0.000}
                size={[7.5, 2.5, 7]}
                type={"rockface"}
            />

            <Obstacle
                position={[-4.5, 2.75, 14]}
                rotation={4.712}
                size={[-2.5, 5.5, 2.5]}
                type={"rockface"}
            />

            <Turret
                position={[-4.5, 4.5, 14]}
                rotation={4.712}
                floorLevel={0}
            />

            <Plant
                position={[-4, 0, 17.5]}
                rotation={4.320}

            />
        </WorldPartWrapper>
    )
}