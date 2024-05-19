import Line from "./Line"
import { height, width } from "./utils"

export default function Grid() {
    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
                width: "clamp(8em, 30vw, 350px)",
                overflow: "visible",
                zIndex: 0,
                position: "absolute",
                left: "50%",
                translate: "-50% 0",
                bottom: 0,
                maskImage: "radial-gradient(at center 60%, black, transparent 70%)",
            }}
        >
            {new Array(15).fill(null).map((i, index, list) => {
                return <Line index={index - list.length * .35} key={index} />
            })}
        </svg>
    )
}