import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeBuilding from "../decoration/EdgeBuilding"
import Barrel from "../spawner/Barrel"
import Building from "../spawner/Building"
import Rocket from "../spawner/Rocket"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Plane from "../spawner/Plane"
import Traffic from "../actors/Traffic"

export default function Default({
    id,
    position,
    size,
}: WorldPartDefault) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Building
                position={[3, 0, 10]}
                size={[5, 2, 5]}
            />
            <Turret
                position={[3, 1, 10]}
                rotation={-Math.PI / 2}
                floorLevel={2}
            />

            <Building
                position={[-.5, 0, 9]}
                size={[4, 1, 3]}
            />
            <Building
                position={[3, 0, 6]}
                size={[3, 1, 3]}
            />
            <Turret
                position={[3, 0, 6]}
                rotation={-Math.PI / 2}
                floorLevel={1}
            />
            <Rocket
                position={[-3, 0, 4]}
            />
            <Barrel
                position={[-1, 1, 9]}
            />
            <Barrel
                position={[-4, 0, 16]}
            />
            <Barrel
                position={[5, 0, 2]}
            />
 
            <Plane
                position={[0, .5, 1]}
                speed={0}
                rotation={.5}
            />


            <Rocket
                position={[4, 0, 17]}
            />

            <Floor
                type={"floor1"}
                scale={[random.pick(-1, 1), 1, random.pick(-1, 1)]}
                position={[position.x, 0, size[1] / 2]}
            />
            <EdgeBuilding z={size[1] / 2} />
        </WorldPartWrapper>
    )
}

// 