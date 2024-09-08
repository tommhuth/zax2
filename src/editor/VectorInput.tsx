import { Fragment } from "react"
import { Tuple3 } from "src/types.global"
import { precision, roundToNearest } from "./data/utils"

interface VectorInputProps {
    legend: string
    value: Tuple3
    readOnly?: boolean
    onUpdate: (x: number, y: number, z: number) => void
}

export default function VectorInput({ legend, value, onUpdate, readOnly = false }: VectorInputProps) {
    let width = "4.5em"

    return (
        <fieldset
            style={{
                display: "flex",
                flexDirection: "column",
                gap: ".75em",
                position: "relative"
            }}
        >
            <legend style={{ opacity: .5 }}>{legend}</legend>
            <div style={{ display: "flex" }}>
                [
                {value.map((v, index) => {
                    return (
                        <Fragment key={index}>
                            <input
                                style={{ width, textAlign: "right", flex: "1 1", cursor: "ns-resize" }}
                                type="number"
                                value={v.toFixed(1)}
                                readOnly
                                aria-label={["x", "y", "z"][index]}
                                step={precision * .5}
                                onPointerUp={() => {
                                    document.exitPointerLock()
                                    onUpdate(...value.map(i => roundToNearest(i, precision)) as Tuple3)
                                }}
                                onPointerMove={({ movementY }) => {
                                    if (!document.pointerLockElement) {
                                        return
                                    }

                                    let updatedValue: Tuple3 = [...value] 

                                    updatedValue[index] += movementY * .025

                                    onUpdate(...updatedValue)
                                }}
                                onPointerDown={({ currentTarget }) => {
                                    currentTarget.requestPointerLock()
                                }}
                            />
                            {index < 2 ? "," : null}
                        </Fragment>
                    )
                })}
                ]
                <button
                    aria-label="Click and move to update x and z values"
                    style={{
                        margin: "-.75em -1em -.75em .5em",
                        border: "1em solid transparent", 
                        borderTopWidth: ".75em",
                        borderBottomWidth: ".75em",
                        cursor: "move",
                        lineHeight: 1,
                        display: readOnly ? "none" : undefined,
                        position: "absolute",
                        left: "100%",
                        bottom: ".25em",
                    }}
                    onPointerUp={() => {
                        document.exitPointerLock()
                        onUpdate(
                            roundToNearest(value[0], precision),
                            value[1],
                            roundToNearest(value[2], precision)
                        )
                    }}
                    onPointerMove={({ movementX, movementY }) => {
                        if (!document.pointerLockElement) {
                            return
                        }

                        onUpdate(
                            value[0] + -movementX * .025,
                            value[1],
                            value[2] + -movementY * .025
                        )
                    }}
                    onPointerDown={(e) => {
                        e.currentTarget.requestPointerLock()
                    }}
                >
                    <span style={{ scale: "2", display: "block" }}>
                        &harr;
                    </span>
                </button>
            </div>
        </fieldset>
    )
}
