import { WorldPartStart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Rocket from "../spawner/Rocket" 
import random from "@huth/random"
import Floor from "../decoration/Floor"
import { AsteroidStart } from "../decoration/AsteroidStart"
import Dirt from "../decoration/Dirt"

export default function Start({
    id,
    position,
    size,
}: WorldPartStart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Dirt 
                position={[0,0,-5]}
                scale={2}
            />
            <AsteroidStart position={[0, 0, position.z]} />

            <Building
                position={[4, 0, 1]}
                size={[3, 3, 3]}
            />
            <Turret
                position={[4, 3, 1]}
                rotation={Math.PI}
                floorLevel={3}
            />

            <Turret
                position={[-2, 1, 2]}
                rotation={-Math.PI / 2}
                floorLevel={1}
            />
            <Building
                position={[-2, 0, 2]}
                size={[3, 1, 3]}
            />
            <Barrel
                position={[-2, 0, 7]}
            />
            <Barrel
                position={[3, 0, -4]}
            />
            <Rocket
                position={[5, 0, 10]}
            />
            <Rocket
                position={[5, 0, 15]}
            />
            <Barrel
                position={[-3, 0, 19]}
            />
            <Barrel
                position={[-4, 0, 14]}
            />

            <Turret
                position={[-2, 0, 11]}
                floorLevel={0}
            />

            <Floor
                type={"floor1"}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                position={[position.x, 0, size[1] / 2]}
            />

            <EdgeBuilding type="tanks" z={size[1] / 2} />
        </WorldPartWrapper>
    )
}

// 