import { Fragment } from "react"
import { Tuple3 } from "src/types.global"
import { precision, roundToNearest } from "../data/utils"

interface VectorInputProps {
    legend: string
    value: Tuple3
    readOnly?: boolean
    onUpdate: (x: number, y: number, z: number) => void
}

export default function VectorInput({
    legend,
    value,
    onUpdate,
    readOnly = false
}: VectorInputProps) {
    let width = "4.5em"

    return (
        <fieldset
            className="vector-input"
        >
            <legend className="vector-input__legend">
                {legend}
            </legend>

            <div className="vector-input__tuple">
                [
                {value.map((v, index) => {
                    return (
                        <Fragment key={index}>
                            <input
                                className="vector-input__input"
                                style={{
                                    width,
                                    cursor: readOnly ? "default" : "ns-resize"
                                }}
                                type="number"
                                value={v.toFixed(2)}
                                readOnly
                                aria-label={["x", "y", "z"][index]}
                                step={precision * .5}
                                onPointerUp={() => {
                                    if (readOnly) {
                                        return
                                    }

                                    document.exitPointerLock()
                                    onUpdate(...value.map(i => roundToNearest(i, precision)) as Tuple3)
                                }}
                                onPointerMove={({ movementY }) => {
                                    if (!document.pointerLockElement || readOnly) {
                                        return
                                    }

                                    let updatedValue: Tuple3 = [...value]

                                    updatedValue[index] += movementY * .025

                                    onUpdate(...updatedValue)
                                }}
                                onPointerDown={({ currentTarget }) => {
                                    if (readOnly) {
                                        return
                                    }

                                    currentTarget.requestPointerLock()
                                }}
                            />
                            {index < 2 ? "," : null}
                        </Fragment>
                    )
                })}
                ]
                <button
                    aria-label="Click and move to translate along x-z plane"
                    className="vector-input__translate"
                    style={{
                        display: readOnly ? "none" : undefined,
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
                    <span>
                        &harr;
                    </span>
                </button>
            </div>
        </fieldset>
    )
}