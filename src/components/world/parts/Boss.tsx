import { WorldPartBoss } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Floor from "../decoration/Floor"
import Boss from "../actors/Boss"

export default function BossPart({
    id,
    position, 
    size,
}: WorldPartBoss) { 
    return (
        <WorldPartWrapper
            size={size}
            position={position}
            id={id}
        >
            <Boss 
                pauseAt={position.z + 15} 
                startPosition={[0, 0, position.z + 25]} 
            />  

            <Floor
                type={"floor1"}
                scale={[1, 1, 4]}
                position={[position.x, 0, size[1] / 2]}
            />
        </WorldPartWrapper>
    )
}
 