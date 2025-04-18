import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Floor from "../actors/Floor"
import TurretSpawner from "../spawner/Turret"
import Obstacle from "../actors/Obstacle"
import EdgeElement from "../actors/EdgeElement"
import Cable from "../actors/Cable"
import Dirt from "../actors/Dirt"
import BarrelSpawner from "../spawner/Barrel"
import { memo } from "react"

function BuildingsLow({
    id,
    position,
    size,
    type
}: WorldPart) {
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
            type={type}
        >
            <Floor
                position={[position.x, 0, size[1] / 2]}
                type="floor2"
            />

            <BarrelSpawner
                position={[-0.5, 0, 2.5]}
            />

            <Dirt
                position={[0.5, 0, 4]}
                rotation={0.733}
                scale={1.6}
            />

            <Obstacle
                position={[3.5, 0.5, 4.5]}
                rotation={0}
                size={[4.5, 1, 1]}
                type={"box"}
            />

            <Obstacle
                position={[3.5, 0.5, 8]}
                rotation={0}
                size={[4.5, 1, 5.5]}
                type={"box"}
            />

            <EdgeElement
                position={[11.5, 0, 5]}
                rotation={0}
                scale={[1, 1, 1]}
                type={"tanks"}
            />

            <TurretSpawner
                position={[4, 0, 8.5]}
                rotation={4.712}
                floorLevel={1}
            />

            <BarrelSpawner
                position={[-1, 0, 9]}
            />

            <Cable
                position={[-4, 0, 9]}
                rotation={4.398}
                scale={0.7}
            />

            <Obstacle
                position={[3.5, 1, 13]}
                rotation={0}
                size={[4.5, 2, 3]}
                type={"box"}
            />

            <Obstacle
                position={[-1, 0.5, 13]}
                rotation={0}
                size={[3, 1, 3]}
                type={"device"}
            />

            <Obstacle
                position={[4.5, 2, 13]}
                rotation={0}
                size={[2, 0.5, 2]}
                type={"device"}
            />

            <EdgeElement
                position={[10, 0, 15.5]}
                rotation={3.142}
                scale={[1, 1, 1]}
                type={"wall2"}
            />

            <Obstacle
                position={[3.5, 1, 17]}
                rotation={0}
                size={[4.5, 2, 3]}
                type={"box"}
            />

            <Obstacle
                position={[-1, 0.5, 17]}
                rotation={0}
                size={[3, 1, 3]}
                type={"box"}
            />

            <TurretSpawner
                position={[-1, 0, 17]}
                rotation={4.712}
                floorLevel={1}
            />
        </WorldPartWrapper>
    )
}

export default memo(BuildingsLow)