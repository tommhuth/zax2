import { clamp, list, map } from "@data/utils"
import { PointerEvent, useState } from "react"
import { useEditorStore } from "../data/store"
import { setCameraPosition } from "../data/actions"

export default function Panner() {
    let [panning, setPanning] = useState(false)
    let z = useEditorStore(i => i.cameraPosition[2])
    let width = 350
    let barCount = 50
    let min = -15
    let max = 70
    let updateCamera = (e: PointerEvent<HTMLDivElement>) => {
        let rect = e.currentTarget.getBoundingClientRect()
        let x = clamp(e.clientX - rect.left, 0, width)

        setCameraPosition(0, 0, Math.round(map(x / width, 0, 1, min, max)))
    }

    return (
        <div
            style={{
                display: "flex",
                height: "1em",
                flex: "0 0",
                flexBasis: width,
                position: "relative",
                cursor: panning ? "grabbing" : "grab"
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
                    bottom: "100%",
                    marginBottom: ".25em",
                    translate: "-50% 0",
                    position: "absolute",
                }}
            >
                {z}
            </div>
            {list(barCount).map((index) => {
                return (
                    <div
                        key={index}
                        style={{
                            flex: "0 0 ",
                            flexBasis: width / barCount,
                            boxSizing: "border-box",
                            borderLeftWidth: index === 10 ? 2 : 1,
                            borderLeftColor: "white",
                            borderLeftStyle: "solid",
                            opacity: index === Math.round(map(z, min, max, 0, barCount)) ? 1 : .35,
                            height: "100%",
                        }}
                    />
                )
            })}
        </div>
    )
}