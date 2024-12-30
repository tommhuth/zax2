import { Tuple3 } from "src/types.global"
import { useWorldPart } from "../WorldPartWrapper"
import GrassModel from "../models/GrassModel"

interface GrassProps {
    position: Tuple3
    rotation?: number
}

export default function Grass({ position: [x, y, z], rotation }: GrassProps) {
    let partPosition = useWorldPart()

    return (
        <GrassModel
            rotation={rotation}
            position={[x, y, partPosition[2] + z]}
        />
    )
} 