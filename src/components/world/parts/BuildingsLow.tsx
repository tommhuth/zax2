import { WorldPartBuildingsLow } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building" 
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Grass from "../decoration/Grass"
import Plant from "../decoration/Plant"

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
                position={[7, 0, 0]}
                scale={[1.5, 1.5, 1.5]}
            />

            <Turret position={[-3, 0, 2]} />
            <Turret position={[4, 0, 10]}
                rotation={-Math.PI/2}
            />

            <Barrel
                position={[-3, 0, 10]}
            />
            <Barrel
                position={[2, 0, 14]}
            />

            <Grass
                position={[-8, 0, size[1] / 2 - 2]}
            />
            <Building
                position={[0, 0, size[1] - 2]}
                size={[3, 1, 3]}
            />
            <Grass
                position={[9, 0, size[1] / 2 - 1]}
            />
            
            <Turret 
                position={[0, 1, size[1] - 2]}
                rotation={-Math.PI / 2}
            />

            <Plant
                position={[-4, 0, size[1]]}
                scale={[1, 1, 1]}
            />

            <Plant
                position={[7, 0, size[1] - 1.5]}
                scale={[1.25, 1.25, 1.25]}
            />
            <Floor
                position={[position.x  , 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                type="floor3"
            />
        </WorldPartWrapper>
    )
}