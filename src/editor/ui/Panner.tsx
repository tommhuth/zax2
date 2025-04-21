import { clamp, list, map } from "@data/utils"
import { PointerEvent, useState } from "react"
import { useEditorStore } from "../data/store"
import { setCameraPosition } from "../data/actions"

export default function Panner() {
    let [panning, setPanning] = useState(false)
    let z = useEditorStore(i => i.cameraPosition[2])
    let width = 350
    let min = -15
    let max = 70
    let barCount = 50
    let updateCamera = (e: PointerEvent<HTMLDivElement>) => {
        let rect = e.currentTarget.getBoundingClientRect()
        let x = clamp(e.clientX - rect.left, 0, width)

        setCameraPosition(0, 0, Math.round(map(x / width, 0, 1, min, max)))
    }

    return (
        <div
            className="panner"
            style={{
                cursor: panning ? "grabbing" : "grab",
                flexBasis: width,
            }}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                setPanning(true)
                updateCamera(e)
            }}
            onPointerMove={e => {
                if (!panning) {
                    return
                }

                updateCamera(e)
            }}
            onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId)
                setPanning(false)
            }}
        >
            <div
                style={{
                    left: map(z, min, max, 0, width),
                }}
                className="panner__current"
            >
                {z}
            </div>

            {list(barCount + 1).map((index) => {
                return (
                    <div
                        key={index}
                        className="panner__tick"
                        style={{
                            opacity: index === Math.round(map(z, min, max, 0, barCount)) ? 1 : .35,
                            flexBasis: width / barCount,
                        }}
                    />
                )
            })}
        </div>
    )
}