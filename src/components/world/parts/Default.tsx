import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeElement from "../actors/EdgeElement"
import random from "@huth/random"
import Floor from "../actors/Floor"
import Dirt from "../actors/Dirt"
import Cable from "../actors/Cable"
import Obstacle from "../actors/Obstacle"
import TurretSpawner from "../spawner/Turret"
import BarrelSpawner from "../spawner/Barrel"

export default function Default({
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
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor1"
            />

            <TurretSpawner
                position={[-3, -0.5, 2]}
                rotation={0}
                floorLevel={0}
            />

            <EdgeElement
                position={[9, 0, 3.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall3"}
            />

            <BarrelSpawner
                position={[5.5, 0, 4]}
            />

            <Dirt
                position={[1, 0, 7.5]}
                rotation={0}
                scale={1.4}
            />

            <Cable
                position={[-3.5, 0, 11]}
                rotation={1.047}
                scale={1}
            />

            <BarrelSpawner
                position={[3, 0, 11.5]}
            />

            <EdgeElement
                position={[10.5, 0, 13]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall2"}
            />

            <Obstacle
                position={[5, 1, 15.5]}
                rotation={0}
                size={[3.5, 2, 4]}
                type={"device"}
            />

            <TurretSpawner
                position={[5, 1.5, 15.5]}
                rotation={4.712}
                floorLevel={2}
            />

            <Obstacle
                position={[1.5, 0.5, 15.5]}
                rotation={0}
                size={[3, 1.5, 4]}
                type={"box"}
            />

            <TurretSpawner
                position={[-2, 0, 17]}
                rotation={4.712}
                floorLevel={0}
            />
        </WorldPartWrapper>
    )
}

// 