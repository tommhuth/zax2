import { WorldPartBoss } from "../../../data/types"
import WorldPartWrapper from "../WorldPartWrapper"
import Floor from "../decoration/Floor"
import { Text3D } from "@react-three/drei"
import Boss from "../actors/Boss"

export default function BossPart({
    id,
    position,
    counter,
    size,
}: WorldPartBoss) {
    let textZ = 50

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

            <Text3D
                font="/fonts/roboto.json"
                scale={[3, 3, 8]}
                position-z={position.z + textZ}
                position-y={-1}
                position-x={12}
                rotation-y={Math.PI}
                rotation-x={Math.PI * .5}
                lineHeight={.55}
                receiveShadow
                letterSpacing={-.15}
            >
                LVL
                <meshLambertMaterial color="blue" />
            </Text3D>

            <Text3D
                font="/fonts/roboto.json"
                scale={[5.5, 5.5, 8]}
                rotation-x={Math.PI * .5}
                position-z={position.z + textZ}
                position-x={6}
                position-y={-1}
                rotation-y={Math.PI}
                lineHeight={.55}
                receiveShadow
                letterSpacing={-.05}
            >
                0{counter + 1}
                <meshLambertMaterial color="blue" />
            </Text3D>

            <Floor
                type={"floor1"}
                scale={[1, 1, 4]}
                position={[position.x, 0, size[1] / 2]}
            />
        </WorldPartWrapper>
    )
}
 