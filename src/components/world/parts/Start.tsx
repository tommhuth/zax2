import { WorldPart } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import EdgeElement from "../decoration/EdgeElement"
import Barrel from "../spawner/Barrel"
import Dirt from "../decoration/Dirt"  
import Cable from "../decoration/Cable" 
import Plant from "../actors/Plant" 

export default function Start({
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
            <Plant
                position={[-1, 0, 6]}
                scale={1}
            />
            <Plant
                position={[5, 0, 6]}
                scale={1.1}
            />
            <Cable
                position={[-4, 0, 35]}
                scale={1.25}
                rotation={.5}
            />

            <Barrel position={[3, 0, 29]} />

            <Dirt
                position={[-4, 0, 30]}
                scale={2}
                rotation={2.985}
            />

            <EdgeElement
                type="tanks"
                position={[6, 0, 24]}
                rotation={-Math.PI * .5}
            />
            <EdgeElement
                type="tanks"
                position={[6, 0, 20]}
            />
            <EdgeElement
                type="tanks"
                position={[-6, 0, 6]}
            />
            <EdgeElement
                type="tanks"
                position={[6, 0, -12]}
                rotation={Math.PI * .75}
            />
            <EdgeElement
                type="tanks"
                position={[-6, 0, -12]}
                rotation={Math.PI * -.75}
            />  
        </WorldPartWrapper>
    )
} 