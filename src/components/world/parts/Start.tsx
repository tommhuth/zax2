import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Floor from "../actors/Floor"
import Dirt from "../actors/Dirt"
import Grass from "../actors/Grass"
import Plant from "../actors/Plant"
import BarrelSpawner from "../spawner/Barrel"

export default function Start({
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
                type="floor6"
            />

            <Dirt
                position={[1.5, -5, 21.5]}
                rotation={0}
                scale={1.9}
            />

            <Grass
                position={[8.5, -4.5, 23]}
                rotation={0.314}
            />

            <Dirt
                position={[16, -5, 25.5]}
                rotation={0}
                scale={2.3}
            />

            <Plant
                position={[3, -5.5, 26]}
                rotation={0}
                scale={1.3}
            />

            <Dirt
                position={[8, -3.5, 35.5]}
                rotation={2.321}
                scale={2.1}
            />

            <Grass
                position={[4.5, -3, 36.5]}
                rotation={0.942}
            />

            <Grass
                position={[11.5, -2.5, 36.5]}
                rotation={0}
            />

            <Plant
                position={[0, 0, 50]}
                rotation={2.915}
                scale={1}
            />

            <Plant
                position={[8, 0, 48]}
                rotation={0}
                scale={1}
            />

            <Dirt
                position={[5.5, 0, 49]}
                rotation={0}
                scale={1.8}
            />

            <BarrelSpawner
                position={[-1, 0, 52]}
            />
        </WorldPartWrapper>
    )
}