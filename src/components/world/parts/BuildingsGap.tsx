import random from "@huth/random" 
import WorldPartWrapper from "../WorldPartWrapper"
import Plane from "../spawner/Plane"
import Turret from "../spawner/Turret"
import Floor from "../decoration/Floor" 
import { WorldPart } from "@data/types"

export default function BuildingsGap({
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
            <Plane position={[3, 5, 10]} />
            <Plane position={[-3, 4, 15]} />
            <Turret
                position={[5, 0, 1]}
                rotation={random.pick(-Math.PI / 2, Math.PI)}
                floorLevel={0}
            />
 
            <Turret
                position={[-3, -.5, 2]}
                rotation={random.pick(0, -Math.PI / 2)}
                floorLevel={0}
            />
            <Floor
                position={[position.x, 0, size[1] / 2]}
                scale={[random.pick(-1, 1), 1, .5 * random.pick(-1, 1)]}
                type="floor3"
            /> 
        </WorldPartWrapper>
    )
} 