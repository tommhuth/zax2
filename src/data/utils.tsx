import React, { createContext } from "react"
import { Color, ColorRepresentation, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three"
import { Tuple3, Tuple4 } from "../types"

export function ndelta(delta: number) {
    let nDelta = clamp(delta, 1 / 120, 1 / 30)

    return nDelta
}

export function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num
}

// https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

export function Only(props: { if: any, children: React.ReactNode }) {
    return props.if ? <>{props.children}</> : null
}

// Source: https://medium.com/@Heydon/managing-heading-levels-in-design-systems-18be9a746fa3
const Level = createContext(1)

export function Section({ children }) {
    return (
        <Level.Consumer>
            {level => <Level.Provider value={level + 1}>{children}</Level.Provider>}
        </Level.Consumer>
    )
}

export function Heading(props) {
    return (
        <Level.Consumer>
            {level => {
                const Component = `h${Math.min(level, 6)}`

                return <Component {...props} />
            }}
        </Level.Consumer>
    )
}

export function glsl(strings: TemplateStringsArray, ...variables) {
    let str: string[] = []

    strings.forEach((x, i) => {
        str.push(x)
        str.push(variables[i] || "")
    })

    return str.join("")
}

let _matrix = new Matrix4()
let _quaternion = new Quaternion()
let _position = new Vector3(0, 0, 0)
let _scale = new Vector3(1, 1, 1)
let _euler = new Euler()

interface SetMatrixAtParams {
    instance: InstancedMesh
    index: number
    position?: Tuple3
    rotation?: Tuple3 | Tuple4
    scale?: Tuple3 | number
}

export function setMatrixAt({
    instance,
    index,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
}: SetMatrixAtParams) {
    instance.setMatrixAt(index, _matrix.compose(
        _position.set(...position),
        rotation.length === 3 ? _quaternion.setFromEuler(_euler.set(...rotation, "XYZ")) : _quaternion.set(...rotation),
        Array.isArray(scale) ? _scale.set(...scale) : _scale.set(scale, scale, scale),
    ))
    instance.instanceMatrix.needsUpdate = true
    instance.computeBoundingSphere()
}

export function setMatrixNullAt(instance: InstancedMesh, index: number) {
    setMatrixAt({
        instance,
        index,
        position: [0, 0, 100_000],
        scale: [0, 0, 0],
        rotation: [0, 0, 0]
    })
}

const _color = new Color()

export function setColorAt(instance: InstancedMesh, index: number, color: ColorRepresentation) {
    instance.setColorAt(index, _color.set(color))

    if (instance.instanceColor) {
        instance.instanceColor.needsUpdate = true
    }
}