import { WorldPartDefault } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Turret from "../spawner/Turret"
import EdgeElement from "../decoration/EdgeElement"
import Barrel from "../spawner/Barrel" 
import Rocket from "../spawner/Rocket"
import random from "@huth/random"
import Floor from "../decoration/Floor"
import Plane from "../spawner/Plane"

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
            <EdgeElement
                z={7}
                x={10}
                type="wall2"
            />
            <EdgeElement
                z={14}
                x={8.5}
                type="wall3"
            />
            <EdgeElement
                z={24}
                x={10}
                type="wall3"
            />
            <EdgeElement
                z={24}
                x={8}
                type="tower1"
            />
            <EdgeElement
                z={28}
                x={8}
                type="tower1"
            /> 
            <Turret
                position={[3, 1, 10]}
                rotation={-Math.PI / 2}
                floorLevel={2}
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
                position={[-1, 0, 9]}
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
        </WorldPartWrapper>
    )
}

// 