import { WorldPartBuildingsLow } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Grass from "../decoration/Grass"
import Plant from "../decoration/Plant"
import Traffic from "../actors/Traffic"
import { Rockface } from "../decoration/Rockface"

export default function BuildingsLow({
    id,
    position,
    size,
}: WorldPartBuildingsLow) {
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
                position={[4, .3, 16]}
            />

            <Grass
                position={[-8, 0, size[1] / 2 - 2]}
            />
            <Rockface
                position={[8, 1, position.z + 12]}
                scale={[4, 3, 5]}
            />

            <Rockface
                position={[10, 0, position.z + 9]}
                scale={[5, 3, 4]}
                rotation={[0, .1, 0]}
            />

            <Rockface
                position={[0, 0,  position.z + size[1] - 2]}
                scale={[4, 5, 6]}
                rotation={[0, -.2, 0]}
            />
            <Turret
                position={[0, 2, size[1] - 2]}
                rotation={-Math.PI / 2}
                floorLevel={1}
            /> 

            <Plant
                position={[-1, 1, 6]}
                scale={1}
            />

            <Plant
                position={[7, 3, 11]}
                scale={1}
            />
            <Floor
                position={[position.x, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="floor6"
            />
            <Floor
                position={[position.x, 0, size[1] / 2]} 
                type="floor2"
            />
        </WorldPartWrapper>
    )
}